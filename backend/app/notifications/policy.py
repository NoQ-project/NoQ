from backend.app.notifications.models import NotificationType


NOTIFICATION_THRESHOLDS = {
    10,
    5,
    2,
    1,
}


def get_threshold_notification(
    people_ahead: int,
):
    if people_ahead == 10:
        return {
            "type": NotificationType.PEOPLE_AHEAD_THRESHOLD,
            "title": "10 people ahead",
            "message": "There are 10 people ahead of you.",
            "threshold": 10,
        }

    if people_ahead == 5:
        return {
            "type": NotificationType.PEOPLE_AHEAD_THRESHOLD,
            "title": "5 people ahead",
            "message": "There are 5 people ahead of you.",
            "threshold": 5,
        }

    if people_ahead == 2:
        return {
            "type": NotificationType.PEOPLE_AHEAD_THRESHOLD,
            "title": "2 people ahead",
            "message": "There are 2 people ahead of you.",
            "threshold": 2,
        }

    if people_ahead == 1:
        return {
            "type": NotificationType.PEOPLE_AHEAD_THRESHOLD,
            "title": "1 person ahead",
            "message": "There is 1 person ahead of you.",
            "threshold": 1,
        }

    return None