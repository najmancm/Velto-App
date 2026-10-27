import re
from datetime import date, timedelta


TASK_LIST_PREFIXES = (
    re.compile(
        r"(?:my\s+)?(?:(?:today|tomorrow)'?s\s+)?tasks?"
        r"(?:\s+(?:for|on)?\s*(?:today|tomorrow))?\s+"
        r"(?:are|include|includes)\s*(?:these\b)?\s*:?\s*",
        re.IGNORECASE,
    ),
    re.compile(r"(?:add|create|schedule)\s+(?:these\s+)?tasks?\s*:?\s*", re.IGNORECASE),
)


def parse_task_list(message, today=None):
    text = message.strip()
    prefix_match = next((pattern.match(text) for pattern in TASK_LIST_PREFIXES if pattern.match(text)), None)
    if not prefix_match:
        return None

    content = text[prefix_match.end():]
    titles = []
    for item in re.split(r"\n|[,;]|\s+and\s+|\.\s+", content, flags=re.IGNORECASE):
        title = re.sub(r"^\s*(?:[-*•]|\d+[.)])\s*", "", item)
        title = re.sub(r"^\s*:\s*", "", title)
        title = re.sub(r"^\s*(?:please\s+)?(?:(?:i|we)\s+(?:need|want|wanna|plan)\s+to\s+)?", "", title, flags=re.IGNORECASE)
        title = re.sub(r"[.!?]+\s*$", "", title).strip()[:140]
        if title and title.casefold() not in {existing.casefold() for existing in titles}:
            titles.append(title)
        if len(titles) == 10:
            break

    if not titles:
        return None

    today = today or date.today()
    if re.search(r"\b(tomorrow|tomorrow's|tomorrows)\b", text, re.IGNORECASE):
        due_date = (today + timedelta(days=1)).isoformat()
    elif re.search(r"\b(today|today's|todays|tonight)\b", text, re.IGNORECASE):
        due_date = today.isoformat()
    else:
        due_date = None

    return [
        {'title': title, 'due_date': due_date, 'priority': 'medium', 'completed': False}
        for title in titles
    ]
