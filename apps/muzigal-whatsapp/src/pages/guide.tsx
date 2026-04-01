import { Card } from '@zoo/ui';
import {
  Rocket,
  BarChart3,
  Users,
  Megaphone,
  MessageCircle,
  Settings,
  AlertTriangle,
  Palette,
} from 'lucide-react';

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
    </div>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5 text-sm text-zinc-600 list-disc list-inside ml-1">{children}</ul>;
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-zinc-800 mt-3 mb-1">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs font-mono">{children}</code>;
}

export default function Guide() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="mb-2">
        <h1 className="text-lg font-bold text-zinc-900">User Guide</h1>
        <p className="text-sm text-zinc-500">Quick reference for the WhatsApp Messaging Dashboard</p>
      </div>

      {/* 1. Getting Started */}
      <Card>
        <SectionHeader icon={Rocket} title="Getting Started" />
        <Ul>
          <li>This app lets music academies broadcast WhatsApp messages to students — schedule reminders, fee notices, class changes, and announcements.</li>
          <li><strong>Demo mode</strong> — uses bundled mock data; no real messages are sent. Great for exploring the interface.</li>
          <li><strong>Production mode</strong> — requires a Google Apps Script backend. Set <Code>VITE_GAS_URL</Code> in your environment to enable live data and real messaging.</li>
        </Ul>
        <SubHead>Login</SubHead>
        <Ul>
          <li>Demo: <Code>demo@zoo.crm</Code> / <Code>demo</Code></li>
          <li>Admin accounts are configured in <Code>config/client.ts</Code></li>
          <li>Production: same credentials, but data comes from your live Google Sheet</li>
        </Ul>
      </Card>

      {/* 2. Dashboard */}
      <Card>
        <SectionHeader icon={BarChart3} title="Dashboard" />
        <SubHead>Stat Cards</SubHead>
        <Ul>
          <li><strong>Active Students</strong> — currently enrolled with unexpired subscriptions</li>
          <li><strong>Messages Sent</strong> — total WhatsApp messages dispatched (all time)</li>
          <li><strong>Delivery Rate</strong> — percentage of sent messages successfully delivered</li>
          <li><strong>Expiring Soon</strong> — students whose subscription expires within 7 days</li>
        </Ul>
        <SubHead>Quick Actions</SubHead>
        <Ul>
          <li>One-click shortcuts to Broadcast, Test Message, and Settings</li>
        </Ul>
        <SubHead>Message Log Badges</SubHead>
        <Ul>
          <li><strong>Schedule</strong> — daily class schedule reminder</li>
          <li><strong>Broadcast</strong> — bulk announcement to a group</li>
          <li><strong>Teacher Change</strong> — substitute teacher notification</li>
          <li><strong>Cancellation</strong> — class cancelled notice</li>
          <li><strong>Reschedule</strong> — class time/date changed</li>
          <li><strong>Test</strong> — test message sent from the Test page</li>
        </Ul>
      </Card>

      {/* 3. Students */}
      <Card>
        <SectionHeader icon={Users} title="Students" />
        <Ul>
          <li><strong>Search</strong> — by name, Student ID, phone number, or email</li>
          <li><strong>Filters</strong> — Subject (Piano, Guitar, etc.), Status (Active, Renewed, etc.), Duration (1/3/6/12 months)</li>
          <li><strong>Sessions column</strong> — shows completed / total sessions (e.g., 8/12)</li>
          <li><strong>Expiry highlighting</strong> — red if expired, amber if expiring within 7 days</li>
          <li><strong>Pagination</strong> — 20 students per page; use arrows to navigate</li>
        </Ul>
      </Card>

      {/* 4. Broadcast */}
      <Card>
        <SectionHeader icon={Megaphone} title="Broadcast" />
        <SubHead>Target Types</SubHead>
        <Ul>
          <li><strong>All Students</strong> — closure notices, holiday announcements, general updates</li>
          <li><strong>By Batch</strong> — schedule-specific messages (e.g., "Sunday 11 AM batch rescheduled")</li>
          <li><strong>By Subject</strong> — instrument-specific updates (e.g., "Guitar exam dates")</li>
          <li><strong>Individual</strong> — personal messages to a single student</li>
          <li><strong>Expiring</strong> — renewal reminders for students about to expire</li>
        </Ul>
        <SubHead>Quick Templates</SubHead>
        <Ul>
          <li>Pre-built templates for common scenarios — select one to auto-fill the message field</li>
          <li>Templates support variables like student name and amount</li>
        </Ul>
        <SubHead>Recipient Preview</SubHead>
        <Ul>
          <li>Before sending, review the exact list of recipients in the preview panel</li>
          <li>Verify count and names before confirming the broadcast</li>
        </Ul>
      </Card>

      {/* 5. Test Message */}
      <Card>
        <SectionHeader icon={MessageCircle} title="Test Message" />
        <Ul>
          <li>Send a test WhatsApp message to any phone number</li>
          <li>Phone format: country code + number, no spaces or dashes (e.g., <Code>919876543210</Code>)</li>
          <li>Use this to verify your WhatsApp provider connection is working</li>
          <li><strong>Recent Tests</strong> — history of previously sent test messages with delivery status</li>
        </Ul>
      </Card>

      {/* 6. Settings */}
      <Card>
        <SectionHeader icon={Settings} title="Settings" />

        <SubHead>Connection Tab</SubHead>
        <Ul>
          <li>Choose your WhatsApp provider: <strong>Meta Cloud API</strong>, <strong>Twilio</strong>, <strong>Gupshup</strong>, or <strong>Custom Webhook</strong></li>
        </Ul>
        <p className="text-sm text-zinc-600 mt-2 mb-1 ml-1">Meta setup steps:</p>
        <ol className="space-y-1 text-sm text-zinc-600 list-decimal list-inside ml-3">
          <li>Create a Meta Business Account at business.facebook.com</li>
          <li>Set up WhatsApp Business in the Meta dashboard</li>
          <li>Copy your Phone Number ID and Access Token</li>
          <li>Paste them in Settings &gt; Connection</li>
          <li>Click "Test Connection" to verify</li>
        </ol>
        <p className="text-sm text-zinc-600 mt-2 ml-1">
          <strong>Token types:</strong> <em>Temporary</em> = expires every 24h (must refresh manually). <em>System User</em> = permanent token (recommended for production).
        </p>

        <SubHead>Business Tab</SubHead>
        <Ul>
          <li>Academy name, contact info, address</li>
          <li>Admin users and their roles</li>
          <li>Teacher list (name, instrument, phone)</li>
          <li>Message templates and their approval status</li>
        </Ul>

        <SubHead>Automation Tab</SubHead>
        <Ul>
          <li><strong>Daily Schedule</strong> — auto-send class reminders at a set time each day</li>
          <li><strong>Fee Reminders</strong> — auto-notify students X days before subscription expires</li>
          <li><strong>AI Composition</strong> — use Claude to draft messages (requires API key)</li>
        </Ul>

        <SubHead>Data Tab</SubHead>
        <Ul>
          <li><strong>Import Excel</strong> — upload a new student Excel file (must have "Student Details", "Enquiry Details", "Student Batch" sheets)</li>
          <li><strong>Google Sheet Sync</strong> — paste your Sheet URL and enable auto-sync at a configurable interval</li>
        </Ul>
      </Card>

      {/* 7. Limitations */}
      <Card>
        <SectionHeader icon={AlertTriangle} title="Limitations" />
        <Ul>
          <li><strong>Demo mode</strong> — mock data only; no real WhatsApp messages are sent</li>
          <li><strong>Production mode</strong> — requires a deployed Google Apps Script backend (<Code>VITE_GAS_URL</Code>)</li>
          <li><strong>Rate limit</strong> — 200ms delay between messages (configurable in Automation settings)</li>
          <li><strong>Template approval</strong> — WhatsApp template messages must be pre-approved by Meta before use</li>
          <li><strong>Daily cap</strong> — Meta free tier allows max 1,000 messages/day</li>
        </Ul>
      </Card>

      {/* 8. Adapting for Your Academy */}
      <Card>
        <SectionHeader icon={Palette} title="Adapting for Your Academy" />
        <Ul>
          <li><strong>Branding</strong> — update academy name, logo, and contact info in Settings &gt; Business</li>
          <li><strong>WhatsApp provider</strong> — switch between Meta / Twilio / Gupshup / Custom in Settings &gt; Connection</li>
          <li><strong>Import students</strong> — Settings &gt; Data &gt; Import Excel</li>
        </Ul>
        <SubHead>Excel Format Required</SubHead>
        <Ul>
          <li>Sheet 1: <strong>"Student Details"</strong> — StudentID, StudentName, Subjects, ContactNumber, ExpiryDate, Status, TotalSessions, CompletedSessions, etc.</li>
          <li>Sheet 2: <strong>"Enquiry Details"</strong> — NameOfContact, ContactNumber, Source, Status, InstrumentInterested</li>
          <li>Sheet 3: <strong>"Student Batch"</strong> — StudentName, StudentID, BatchTime, Days, Subject</li>
        </Ul>
        <SubHead>Live Google Sheet</SubHead>
        <Ul>
          <li>Paste the Google Sheet URL in Settings &gt; Data</li>
          <li>Enable auto-sync and set the refresh interval (in minutes)</li>
          <li>The sheet must follow the same structure as the Excel file above</li>
        </Ul>
      </Card>

      <div className="pb-4" />
    </div>
  );
}
