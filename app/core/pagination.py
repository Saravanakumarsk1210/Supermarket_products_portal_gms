def paginate_meta(total: int, page: int, per_page: int) -> dict[str, int]:
    total_pages = max(1, (total + per_page - 1) // per_page)
    return {
        "total_count": total,
        "total_pages": total_pages,
        "current_page": page,
        "per_page": per_page,
    }
