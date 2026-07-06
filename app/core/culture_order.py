"""Doubly-linked ordering for culture_banners (separate chains for active and inactive)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site import CultureBanner


def _pool(items: list[CultureBanner], is_active: bool) -> list[CultureBanner]:
    return [b for b in items if bool(b.is_active) == is_active]


def _by_id(items: list[CultureBanner]) -> dict[int, CultureBanner]:
    return {b.id: b for b in items}


def walk_chain(items: list[CultureBanner], is_active: bool) -> list[CultureBanner]:
    pool = _pool(items, is_active)
    if not pool:
        return []

    bid = _by_id(pool)
    ids = {b.id for b in pool}
    heads = [b for b in pool if not b.prev_culture_id or b.prev_culture_id not in ids]
    if not heads:
        return sorted(pool, key=lambda b: (b.display_order, b.id))

    head = min(heads, key=lambda b: (b.display_order, b.id))
    out: list[CultureBanner] = []
    seen: set[int] = set()
    cur: CultureBanner | None = head
    while cur and cur.id not in seen:
        seen.add(cur.id)
        out.append(cur)
        nxt_id = cur.next_culture_id
        cur = bid.get(nxt_id) if nxt_id in ids else None

    for b in sorted(pool, key=lambda b: (b.display_order, b.id)):
        if b.id not in seen:
            out.append(b)
    return out


def chains_need_init(items: list[CultureBanner]) -> bool:
    if not items:
        return False

    for is_active in (True, False):
        pool = _pool(items, is_active)
        if len(pool) <= 1:
            continue
        ids = {b.id for b in pool}
        has_links = any(b.prev_culture_id or b.next_culture_id for b in pool)
        if not has_links:
            return True
        for b in pool:
            if b.prev_culture_id and b.prev_culture_id not in ids:
                return True
            if b.next_culture_id and b.next_culture_id not in ids:
                return True
    return False


def link_sequence(seq: list[CultureBanner]) -> None:
    for i, b in enumerate(seq):
        b.prev_culture_id = seq[i - 1].id if i > 0 else None
        b.next_culture_id = seq[i + 1].id if i < len(seq) - 1 else None
        b.display_order = i


def rebuild_from_display_order(items: list[CultureBanner]) -> None:
    active = sorted(_pool(items, True), key=lambda b: (b.display_order, b.id))
    inactive = sorted(_pool(items, False), key=lambda b: (b.display_order, b.id))
    link_sequence(active)
    link_sequence(inactive)


def sync_display_orders(items: list[CultureBanner]) -> None:
    for is_active in (True, False):
        for i, b in enumerate(walk_chain(items, is_active)):
            b.display_order = i


def _unlink_in_pool(item: CultureBanner, bid: dict[int, CultureBanner]) -> None:
    prev = bid.get(item.prev_culture_id) if item.prev_culture_id else None
    nxt = bid.get(item.next_culture_id) if item.next_culture_id else None
    if prev:
        prev.next_culture_id = item.next_culture_id
    if nxt:
        nxt.prev_culture_id = item.prev_culture_id
    item.prev_culture_id = None
    item.next_culture_id = None


def unlink_culture(item: CultureBanner, items: list[CultureBanner]) -> None:
    _unlink_in_pool(item, _by_id(items))


def append_to_tail(item: CultureBanner, items: list[CultureBanner]) -> None:
    unlink_culture(item, items)
    chain = walk_chain(items, bool(item.is_active))
    chain = [b for b in chain if b.id != item.id]
    if chain:
        last = chain[-1]
        last.next_culture_id = item.id
        item.prev_culture_id = last.id
        item.next_culture_id = None
    else:
        item.prev_culture_id = None
        item.next_culture_id = None
    sync_display_orders(items)


def insert_at_index(item: CultureBanner, items: list[CultureBanner], index: int) -> None:
    unlink_culture(item, items)
    chain = walk_chain(items, bool(item.is_active))
    chain = [b for b in chain if b.id != item.id]
    index = max(0, min(index, len(chain)))
    bid = _by_id(items)

    if not chain:
        item.prev_culture_id = None
        item.next_culture_id = None
    elif index == 0:
        head = chain[0]
        item.next_culture_id = head.id
        head.prev_culture_id = item.id
        item.prev_culture_id = None
    else:
        after = chain[index - 1]
        item.prev_culture_id = after.id
        item.next_culture_id = after.next_culture_id
        if after.next_culture_id:
            bid[after.next_culture_id].prev_culture_id = item.id
        after.next_culture_id = item.id

    sync_display_orders(items)


def swap_adjacent(a: CultureBanner, b: CultureBanner, bid: dict[int, CultureBanner]) -> None:
    a_prev = a.prev_culture_id
    b_next = b.next_culture_id
    if a_prev:
        bid[a_prev].next_culture_id = b.id
    b.prev_culture_id = a_prev
    b.next_culture_id = a.id
    a.prev_culture_id = b.id
    a.next_culture_id = b_next
    if b_next:
        bid[b_next].prev_culture_id = a.id


def move_culture(item: CultureBanner, items: list[CultureBanner], direction: str) -> bool:
    pool = _pool(items, bool(item.is_active))
    bid = _by_id(pool)
    if direction == "left":
        prev = bid.get(item.prev_culture_id) if item.prev_culture_id else None
        if not prev:
            return False
        swap_adjacent(prev, item, bid)
    elif direction == "right":
        nxt = bid.get(item.next_culture_id) if item.next_culture_id else None
        if not nxt:
            return False
        swap_adjacent(item, nxt, bid)
    else:
        return False
    sync_display_orders(items)
    return True


def relocate_on_active_change(item: CultureBanner, items: list[CultureBanner], new_active: bool) -> None:
    if bool(item.is_active) == new_active:
        return
    unlink_culture(item, items)
    item.is_active = new_active
    append_to_tail(item, items)


def culture_to_dict(b: CultureBanner, position: int, chain: list[CultureBanner]) -> dict:
    ids = {x.id for x in chain}
    prev_in_chain = b.prev_culture_id in ids if b.prev_culture_id else False
    next_in_chain = b.next_culture_id in ids if b.next_culture_id else False
    return {
        "id": b.id,
        "title": b.title,
        "image_url": b.image_url,
        "link_url": b.link_url,
        "display_order": b.display_order,
        "is_active": b.is_active,
        "position": position,
        "prev_culture_id": b.prev_culture_id,
        "next_culture_id": b.next_culture_id,
        "can_move_left": prev_in_chain,
        "can_move_right": next_in_chain,
    }


def serialize_cultures(items: list[CultureBanner]) -> list[dict]:
    active_chain = walk_chain(items, True)
    inactive_chain = walk_chain(items, False)
    rows: list[dict] = []
    for i, b in enumerate(active_chain):
        rows.append(culture_to_dict(b, i, active_chain))
    for i, b in enumerate(inactive_chain):
        rows.append(culture_to_dict(b, i, inactive_chain))
    return rows


async def load_all_cultures(db: AsyncSession) -> list[CultureBanner]:
    result = await db.execute(select(CultureBanner))
    return list(result.scalars().all())


async def ensure_culture_chains(db: AsyncSession) -> list[CultureBanner]:
    items = await load_all_cultures(db)
    if chains_need_init(items):
        rebuild_from_display_order(items)
        await db.commit()
    return items


async def ordered_active_cultures(db: AsyncSession) -> list[CultureBanner]:
    items = await ensure_culture_chains(db)
    return walk_chain(items, True)
