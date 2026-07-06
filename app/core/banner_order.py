"""Doubly-linked ordering for site_banners (separate chains for active and inactive)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site import SiteBanner


def _pool(banners: list[SiteBanner], is_active: bool) -> list[SiteBanner]:
    return [b for b in banners if bool(b.is_active) == is_active]


def _by_id(banners: list[SiteBanner]) -> dict[int, SiteBanner]:
    return {b.id: b for b in banners}


def walk_chain(banners: list[SiteBanner], is_active: bool) -> list[SiteBanner]:
    """Traverse the doubly-linked list for active or inactive banners."""
    pool = _pool(banners, is_active)
    if not pool:
        return []

    bid = _by_id(pool)
    ids = {b.id for b in pool}
    heads = [b for b in pool if not b.prev_banner_id or b.prev_banner_id not in ids]
    if not heads:
        return sorted(pool, key=lambda b: (b.display_order, b.id))

    head = min(heads, key=lambda b: (b.display_order, b.id))
    out: list[SiteBanner] = []
    seen: set[int] = set()
    cur: SiteBanner | None = head
    while cur and cur.id not in seen:
        seen.add(cur.id)
        out.append(cur)
        nxt_id = cur.next_banner_id
        cur = bid.get(nxt_id) if nxt_id in ids else None

    for b in sorted(pool, key=lambda b: (b.display_order, b.id)):
        if b.id not in seen:
            out.append(b)
    return out


def chains_need_init(banners: list[SiteBanner]) -> bool:
    if not banners:
        return False

    for is_active in (True, False):
        pool = _pool(banners, is_active)
        if len(pool) <= 1:
            continue
        ids = {b.id for b in pool}
        has_links = any(b.prev_banner_id or b.next_banner_id for b in pool)
        if not has_links:
            return True
        for b in pool:
            if b.prev_banner_id and b.prev_banner_id not in ids:
                return True
            if b.next_banner_id and b.next_banner_id not in ids:
                return True
    return False


def link_sequence(seq: list[SiteBanner]) -> None:
    for i, b in enumerate(seq):
        b.prev_banner_id = seq[i - 1].id if i > 0 else None
        b.next_banner_id = seq[i + 1].id if i < len(seq) - 1 else None
        b.display_order = i


def rebuild_from_display_order(banners: list[SiteBanner]) -> None:
    active = sorted(_pool(banners, True), key=lambda b: (b.display_order, b.id))
    inactive = sorted(_pool(banners, False), key=lambda b: (b.display_order, b.id))
    link_sequence(active)
    link_sequence(inactive)


def sync_display_orders(banners: list[SiteBanner]) -> None:
    for is_active in (True, False):
        for i, b in enumerate(walk_chain(banners, is_active)):
            b.display_order = i


def _unlink_in_pool(banner: SiteBanner, bid: dict[int, SiteBanner]) -> None:
    prev = bid.get(banner.prev_banner_id) if banner.prev_banner_id else None
    nxt = bid.get(banner.next_banner_id) if banner.next_banner_id else None
    if prev:
        prev.next_banner_id = banner.next_banner_id
    if nxt:
        nxt.prev_banner_id = banner.prev_banner_id
    banner.prev_banner_id = None
    banner.next_banner_id = None


def unlink_banner(banner: SiteBanner, banners: list[SiteBanner]) -> None:
    _unlink_in_pool(banner, _by_id(banners))


def append_to_tail(banner: SiteBanner, banners: list[SiteBanner]) -> None:
    unlink_banner(banner, banners)
    chain = walk_chain(banners, bool(banner.is_active))
    chain = [b for b in chain if b.id != banner.id]
    if chain:
        last = chain[-1]
        last.next_banner_id = banner.id
        banner.prev_banner_id = last.id
        banner.next_banner_id = None
    else:
        banner.prev_banner_id = None
        banner.next_banner_id = None
    sync_display_orders(banners)


def insert_at_index(banner: SiteBanner, banners: list[SiteBanner], index: int) -> None:
    unlink_banner(banner, banners)
    chain = walk_chain(banners, bool(banner.is_active))
    chain = [b for b in chain if b.id != banner.id]
    index = max(0, min(index, len(chain)))
    bid = _by_id(banners)

    if not chain:
        banner.prev_banner_id = None
        banner.next_banner_id = None
    elif index == 0:
        head = chain[0]
        banner.next_banner_id = head.id
        head.prev_banner_id = banner.id
        banner.prev_banner_id = None
    else:
        after = chain[index - 1]
        banner.prev_banner_id = after.id
        banner.next_banner_id = after.next_banner_id
        if after.next_banner_id:
            bid[after.next_banner_id].prev_banner_id = banner.id
        after.next_banner_id = banner.id

    sync_display_orders(banners)


def swap_adjacent(a: SiteBanner, b: SiteBanner, bid: dict[int, SiteBanner]) -> None:
    """Swap nodes where a is immediately before b."""
    a_prev = a.prev_banner_id
    b_next = b.next_banner_id
    if a_prev:
        bid[a_prev].next_banner_id = b.id
    b.prev_banner_id = a_prev
    b.next_banner_id = a.id
    a.prev_banner_id = b.id
    a.next_banner_id = b_next
    if b_next:
        bid[b_next].prev_banner_id = a.id


def move_banner(banner: SiteBanner, banners: list[SiteBanner], direction: str) -> bool:
    pool = _pool(banners, bool(banner.is_active))
    bid = _by_id(pool)
    if direction == "left":
        prev = bid.get(banner.prev_banner_id) if banner.prev_banner_id else None
        if not prev:
            return False
        swap_adjacent(prev, banner, bid)
    elif direction == "right":
        nxt = bid.get(banner.next_banner_id) if banner.next_banner_id else None
        if not nxt:
            return False
        swap_adjacent(banner, nxt, bid)
    else:
        return False
    sync_display_orders(banners)
    return True


def relocate_on_active_change(banner: SiteBanner, banners: list[SiteBanner], new_active: bool) -> None:
    if bool(banner.is_active) == new_active:
        return
    unlink_banner(banner, banners)
    banner.is_active = new_active
    append_to_tail(banner, banners)


def banner_to_dict(b: SiteBanner, position: int, chain: list[SiteBanner]) -> dict:
    ids = {x.id for x in chain}
    prev_in_chain = b.prev_banner_id in ids if b.prev_banner_id else False
    next_in_chain = b.next_banner_id in ids if b.next_banner_id else False
    return {
      "id": b.id,
      "title": b.title,
      "subtitle": b.subtitle,
      "image_url": b.image_url,
      "link_url": b.link_url,
      "display_order": b.display_order,
      "is_active": b.is_active,
      "position": position,
      "prev_banner_id": b.prev_banner_id,
      "next_banner_id": b.next_banner_id,
      "can_move_left": prev_in_chain,
      "can_move_right": next_in_chain,
  }


def serialize_banners(banners: list[SiteBanner]) -> list[dict]:
    active_chain = walk_chain(banners, True)
    inactive_chain = walk_chain(banners, False)
    rows: list[dict] = []
    for i, b in enumerate(active_chain):
        rows.append(banner_to_dict(b, i, active_chain))
    for i, b in enumerate(inactive_chain):
        rows.append(banner_to_dict(b, i, inactive_chain))
    return rows


async def load_all_banners(db: AsyncSession) -> list[SiteBanner]:
    result = await db.execute(select(SiteBanner))
    return list(result.scalars().all())


async def ensure_banner_chains(db: AsyncSession) -> list[SiteBanner]:
    banners = await load_all_banners(db)
    if chains_need_init(banners):
        rebuild_from_display_order(banners)
        await db.commit()
    return banners


async def ordered_active_banners(db: AsyncSession) -> list[SiteBanner]:
    banners = await ensure_banner_chains(db)
    return walk_chain(banners, True)
