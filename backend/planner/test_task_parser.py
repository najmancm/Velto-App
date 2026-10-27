from datetime import date
from unittest import TestCase

from .task_parser import parse_task_list


class TaskListParserTests(TestCase):
    def test_parses_comma_and_and_separated_tasks_for_today(self):
        tasks = parse_task_list(
            'My tasks for today are: Read chapter 3, take a walk, and email Sam.',
            today=date(2026, 10, 14),
        )

        self.assertEqual([task['title'] for task in tasks], ['Read chapter 3', 'take a walk', 'email Sam'])
        self.assertTrue(all(task['due_date'] == '2026-10-14' for task in tasks))

    def test_parses_bulleted_tasks_for_tomorrow(self):
        tasks = parse_task_list(
            "Tomorrow's tasks are these:\n- Review notes\n- Make lunch",
            today=date(2026, 10, 14),
        )

        self.assertEqual([task['title'] for task in tasks], ['Review notes', 'Make lunch'])
        self.assertTrue(all(task['due_date'] == '2026-10-15' for task in tasks))

    def test_does_not_invent_dates_for_unscheduled_tasks(self):
        tasks = parse_task_list('Add tasks: Call the dentist', today=date(2026, 10, 14))
        self.assertEqual(tasks[0]['due_date'], None)

    def test_returns_none_for_questions_and_empty_lists(self):
        self.assertIsNone(parse_task_list('What should I focus on today?'))
        self.assertIsNone(parse_task_list('My tasks for today are:'))
