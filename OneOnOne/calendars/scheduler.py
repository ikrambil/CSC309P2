import json
from datetime import datetime, timedelta
from collections import defaultdict
from itertools import cycle
from dateutil import parser
import pytz

def parse_availability(availability_json):
    """Parse the JSON availability data into a list of datetime ranges."""
    availability = json.loads(availability_json)
    return [(parser.parse(slot['start_time']), parser.parse(slot['end_time'])) for slot in availability]

est_tz = pytz.timezone('EST')

def find_overlaps(host_slots, invitee_slots, num_schedules=3):
    """Find up to num_schedules overlapping time slots between host and invitee."""
    overlaps = []
    for host_start, host_end in host_slots:
        for inv_start, inv_end in invitee_slots:
            # Assuming all datetime objects are in UTC timezone
            host_start = host_start.replace(tzinfo=pytz.utc).astimezone(est_tz)
            inv_start = inv_start.replace(tzinfo=pytz.utc).astimezone(est_tz)
            host_end = host_end.replace(tzinfo=pytz.utc).astimezone(est_tz)
            inv_end = inv_end.replace(tzinfo=pytz.utc).astimezone(est_tz)

            start_max = max(host_start, inv_start)
            end_min = min(host_end, inv_end)
            while start_max + timedelta(minutes=30) <= end_min:
                overlaps.append([start_max.isoformat(), (start_max + timedelta(minutes=30)).isoformat()])
                if len(overlaps) == num_schedules:
                    return overlaps
                start_max += timedelta(minutes=30)
    return overlaps

def schedule_invitations(host_availability, invitations):
    """Attempt to schedule meetings based on availabilities, offering grouped schedules,
    reusing old timeslots if necessary to ensure all users are included."""
    invitee_meetings = defaultdict(list)
    host_slots = parse_availability(host_availability)

    for invitation in invitations:
        invitee_slots = parse_availability(invitation.availability)
        possible_overlaps = find_overlaps(host_slots, invitee_slots, num_schedules=3)

        if possible_overlaps:
            invitee_meetings[invitation.invitee_email].extend(possible_overlaps)
            # Adjust host slots based on the overlaps found
            for overlap in possible_overlaps:
                overlap_start, overlap_end = datetime.fromisoformat(overlap[0]), datetime.fromisoformat(overlap[1])
                overlap_start = overlap_start.replace(tzinfo=pytz.utc).astimezone(est_tz).replace(tzinfo=None)
                overlap_end = overlap_end.replace(tzinfo=pytz.utc).astimezone(est_tz).replace(tzinfo=None)
                host_slots = [slot for slot in host_slots if slot[1] <= overlap_start or slot[0] >= overlap_end]
        else:
            # If no overlaps are found, indicate a placeholder for scheduling attempts
            invitee_meetings[invitation.invitee_email].append('No available time slot')

    # Compile schedules, reusing timeslots as necessary
    schedules = []
    for schedule_num in range(3):
        current_schedule = []
        for invitee, times in invitee_meetings.items():
            # Use cycling iterator to reuse timeslots if fewer than 3 are available
            times_iterator = cycle(times)
            for _ in range(schedule_num + 1):  # Advance iterator to the current schedule number
                selected_time = next(times_iterator)

            if selected_time != 'No available time slot':
                current_schedule.append({
                    'invitee': invitee,
                    'meeting_times': selected_time
                })
            else:
                # Handle cases where no timeslots are available by reusing any placeholder
                current_schedule.append({
                    'invitee': invitee,
                    'meeting_times': selected_time
                })

        if current_schedule:
            schedules.append(current_schedule)

    return schedules