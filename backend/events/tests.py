from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from .models import Event, Investigation, ChartDefinition
from core.models import AuditLog

User = get_user_model()

class EventWorkflowTests(TestCase):
    @patch('events.signals.process_new_event.delay')
    def setUp(self, mock_task):
        self.user = User.objects.create_user(username='analyst', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.event = Event.objects.create(
            source=Event.Source.CROWDSTRIKE,
            title='Test Event',
            status=Event.Status.NEW
        )

    def test_bulk_status_update_true_positive(self):
        url = '/api/events/bulk_status_update/'
        data = {
            'ids': [self.event.id],
            'status': Event.Status.TRUE_POSITIVE,
            'reason': 'Verified threat'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.event.refresh_from_db()
        self.assertEqual(self.event.status, Event.Status.TRUE_POSITIVE)
        self.assertEqual(self.event.status_change_reason, 'Verified threat')

        # Check Investigation created
        self.assertTrue(Investigation.objects.filter(event=self.event).exists())

        # Check AuditLog
        self.assertTrue(AuditLog.objects.filter(event=self.event, action__contains='TRUE_POSITIVE').exists())

    def test_reporting_export_excel(self):
        url = '/api/reporting/export_excel/'
        data = {'query_config': {}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    def test_reporting_export_pdf(self):
        url = '/api/reporting/export_pdf/'
        data = {'query_config': {}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_global_search(self):
        url = '/api/search/?q=Test'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['type'], 'Event')

    def test_reporting_generate(self):
        url = '/api/reporting/generate/'
        data = {'query_config': {'model': 'Event', 'group_by': 'source'}}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return list of {name, value}
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]['name'], 'CROWDSTRIKE')
        self.assertEqual(response.data[0]['value'], 1)
