export const CLIENT = {
  name: 'Muzigal',
  tagline: 'WhatsApp Messaging Dashboard',
  portalTitle: 'Muzigal WhatsApp',
  fullName: 'Muzigal Music Academy',

  email: 'muzigal.borewell@gmail.com',
  phone: '+919403890891',

  admins: [
    { email: 'aldrin@atc.xyz', password: 'admin123', name: 'Aldrin Stellus', role: 'admin' as const },
    { email: 'cecil@muzigal.com', password: 'cecil123', name: 'Cecil', role: 'admin' as const },
    { email: 'giri@muzigal.com', password: 'giri123', name: 'Giri', role: 'admin' as const },
  ],
  demoUser: { email: 'demo@zoo.crm', password: 'demo', name: 'Demo User', role: 'admin' as const },
  adminEmails: 'aldrin@atc.xyz,cecil@muzigal.com,giri@muzigal.com',

  teachers: [
    { id: 'T001', name: 'Cecil', email: 'cecil@muzigal.com', instrument: 'Guitar', phone: '+919845100001' },
    { id: 'T002', name: 'Giri', email: 'giri@muzigal.com', instrument: 'Piano', phone: '+919845100002' },
    { id: 'T003', name: 'Lakshmi', email: 'lakshmi@muzigal.com', instrument: 'Carnatic Vocals', phone: '+919845100003' },
  ],

  messages: {
    paymentReminder: (name: string, amount: string) =>
      `Hi ${name}, your payment of ${amount} is due. Please clear it at the earliest. - Muzigal`,
    welcome: (className: string) =>
      `Welcome to Muzigal! Your ${className} classes start next week.`,
    closure: (date: string, reason: string, resumeDate: string) =>
      `Muzigal will be closed on ${date} for ${reason}. Classes resume ${resumeDate}.`,
    testMessage: 'CRM test: If you receive this, WhatsApp integration is working.',
  },
} as const;
