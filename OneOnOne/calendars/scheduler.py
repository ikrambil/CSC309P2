import json
from datetime import datetime, timedelta

def parse_availability(availability_json):
    """Parse the JSON availability data into a list of datetime ranges."""
    availability = json.loads(availability_json)
    return [(datetime.fromisoformat(slot['start_time']), datetime.fromisoformat(slot['end_time'])) for slot in availability]

def find_overlap(host_slots, invitee_slots):
    """Find a single overlapping time slot between host and invitee."""
    for host_start, host_end in host_slots:
        for inv_start, inv_end in invitee_slots:
            start_max = max(host_start, inv_start)
            end_min = min(host_end, inv_end)
            if start_max + timedelta(minutes=30) < end_min:
                return [start_max.isoformat(), (start_max + timedelta(minutes=30)).isoformat()]
    return None

def schedule_invitations(host_availability, invitations):
    """Attempt to schedule meetings based on availabilities."""
    schedules = []
    host_slots = parse_availability(host_availability)

    for invitation in invitations:
        invitee_slots = parse_availability(invitation.availability)
        overlap = find_overlap(host_slots, invitee_slots)
        if overlap:
            schedules.append({
                'invitee': invitation.invitee.username,
                'meeting_time': overlap
            })

            overlap_start, overlap_end = datetime.fromisoformat(overlap[0]), datetime.fromisoformat(overlap[1])

            # Find the index of the slot to remove
            slot_index = next((i for i, slot in enumerate(host_slots) if slot[0] == overlap_start and slot[1] == overlap_end), None)

            # If a matching slot is found, remove it
            # Update the host's availability by reducing the slot used for the meeting
            for i, (host_start, host_end) in enumerate(host_slots):
                if host_start <= overlap_start < host_end:
                    # Adjust the start or end time of the current host slot based on the overlap
                    if host_start == overlap_start:
                        host_slots[i] = (overlap_start + timedelta(minutes=30), host_end)
                    else:
                        host_slots[i] = (host_start, overlap_start)
                    break
        else:
            # Handle cases where no overlap is found
            schedules.append({
                'invitee': invitation.invitee.username,
                'meeting_time': 'No available time slot'
            })

    return schedules