# Cost Analysis & Value Assessment

## WhatsApp Class Notification System for Muzigal

**Client:** Muzigal Musical Academy, Borewell Road, Whitefield, Bangalore
**Developer:** Aldrin Stellus

---

## Executive Summary

The WhatsApp Class Notification System is designed for minimal operating cost. Infrastructure costs are zero (Google Apps Script free tier), leaving only per-message WhatsApp costs and optional Claude AI usage. For a typical music academy with 50 students, monthly operating costs are approximately **INR 525** with Claude disabled, or **INR 1,275** with Claude enabled -- a fraction of what commercial WhatsApp automation platforms charge.

---

## 1. Infrastructure Costs

### Google Apps Script: INR 0/month

The entire system runs on Google Apps Script's free tier. No servers, databases, hosting, or cloud subscriptions are required.

**Free Tier Quotas (Consumer/Workspace accounts):**

| Resource | Free Tier Limit | System Usage (est.) | Headroom |
|---|---|---|---|
| Script execution time | 6 minutes per execution | ~30 seconds for 50 students | 12x headroom |
| Total daily execution time | 90 minutes per day | ~5 minutes (daily + edits) | 18x headroom |
| URL fetch calls (UrlFetchApp) | 20,000 per day | ~100 (50 WhatsApp + 50 Claude) | 200x headroom |
| Emails (MailApp) | 100 per day | 1-5 summary emails | 20x headroom |
| Triggers | 20 per user | 2 (daily + onEdit) | 10x headroom |
| Spreadsheet reads/writes | 50,000 per day | ~500 per daily run | 100x headroom |
| CacheService storage | 100KB per key, 25MB total | ~1KB (10 config values) | Negligible |

**Result:** The system operates well within all free tier limits for academies with up to 500 students.

---

## 2. WhatsApp Message Costs

WhatsApp Business Platform charges per conversation, not per message. Pricing varies by conversation category and country.

### India Pricing (as of 2025)

| Conversation Category | Cost per Conversation | Applies To |
|---|---|---|
| Utility (template-based) | ~INR 0.35 | Scheduled notifications, alerts, updates |
| Marketing | ~INR 0.70 | Promotional messages |
| Authentication | ~INR 0.25 | OTP / verification messages |
| Service (free-form, 24hr window) | Free | Replies within 24hr customer-initiated window |

### Cost Calculations for This System

- **Daily schedule notifications**: Utility template messages at ~INR 0.35 per student per day.
- **Real-time change alerts**: Utility template messages at ~INR 0.35 per affected student per change.
- **Override/emergency messages**: Utility template messages at ~INR 0.35 per recipient.
- **Free-form replies**: Free (within the 24-hour window after a student messages first). This mode is available in the code via `sendFreeForm()` but is not used by default.

### WhatsApp Test Mode

During development and testing, WhatsApp provides **free messaging to up to 5 test phone numbers** registered in the Meta Business Manager. No charges apply until the business account is verified and moved to production.

---

## 3. Claude AI Costs (Optional)

Claude AI message composition is **optional** and can be toggled on or off via the `USE_CLAUDE` config key.

### Anthropic Pricing (Claude Sonnet 4)

| Component | Cost |
|---|---|
| Input tokens | $3.00 per 1 million tokens |
| Output tokens | $15.00 per 1 million tokens |

### Per-Message Cost Estimate

| Component | Tokens | Cost (USD) | Cost (INR, approx.) |
|---|---|---|---|
| System prompt | ~100 tokens | $0.0003 | INR 0.025 |
| User message (context JSON) | ~100 tokens | $0.0003 | INR 0.025 |
| Response (notification text) | ~100 tokens | $0.0015 | INR 0.125 |
| **Total per message** | **~300 tokens** | **~$0.0021** | **~INR 0.18** |

At higher usage or with longer messages, per-message cost may reach INR 0.50-1.50. The system enforces a 300 max_tokens response limit to keep costs predictable.

### When Claude Is Disabled

Setting `USE_CLAUDE=FALSE` in the Config tab eliminates all Claude API costs. The system falls back to hardcoded message templates for all 8 notification types. These templates are professional and include all relevant details (subject, teacher, room, time). For most music academies, the fallback templates are sufficient.

---

## 4. Monthly Cost Projections

The following projections assume 30 days per month with one daily schedule notification per student. Real-time change alerts and overrides add variable costs on top.

### Without Claude AI (USE_CLAUDE=FALSE)

| Students | Messages/Day | WhatsApp/Month | Claude/Month | Total/Month |
|---|---|---|---|---|
| 25 | 25 | INR 263 | INR 0 | **INR 263** |
| 50 | 50 | INR 525 | INR 0 | **INR 525** |
| 100 | 100 | INR 1,050 | INR 0 | **INR 1,050** |
| 200 | 200 | INR 2,100 | INR 0 | **INR 2,100** |
| 500 | 500 | INR 5,250 | INR 0 | **INR 5,250** |

### With Claude AI (USE_CLAUDE=TRUE)

| Students | Messages/Day | WhatsApp/Month | Claude/Month | Total/Month |
|---|---|---|---|---|
| 25 | 25 | INR 263 | INR 135 | **INR 398** |
| 50 | 50 | INR 525 | INR 270 | **INR 795** |
| 100 | 100 | INR 1,050 | INR 540 | **INR 1,590** |
| 200 | 200 | INR 2,100 | INR 1,080 | **INR 3,180** |
| 500 | 500 | INR 5,250 | INR 2,700 | **INR 7,950** |

*Claude estimates assume ~INR 0.18 per message at 300 tokens average. Actual costs may vary based on message complexity.*

---

## 5. Commercial Alternative Comparison

The following are popular WhatsApp Business API platforms in India. All require monthly subscription fees in addition to per-message charges.

| Platform | Monthly Fee | Per-Message Cost | Annual Cost (50 students) | Notes |
|---|---|---|---|---|
| **Interakt** | INR 999/mo | + per-message charges | INR 12,000+ /yr | Requires plan upgrade for automation |
| **Wati** | INR 2,499/mo | + per-message charges | INR 30,000+ /yr | Good UI but expensive for small academies |
| **AiSensy** | INR 999/mo | + per-message charges | INR 12,000+ /yr | Includes chatbot builder |
| **Gallabox** | INR 1,199/mo | + per-message charges | INR 14,400+ /yr | Shared inbox focused |
| **Our System** | **INR 0/mo** | **~INR 0.35/msg** | **INR 6,300 /yr** | No platform fee, WhatsApp charges only |

### Annual Cost Comparison (50 Students, Daily Notifications)

| Solution | Annual Cost (INR) | Savings vs. Our System |
|---|---|---|
| Interakt | INR 12,000+ | - |
| Wati | INR 30,000+ | - |
| AiSensy | INR 12,000+ | - |
| **Our System (no Claude)** | **INR 6,300** | Baseline |
| **Our System (with Claude)** | **INR 9,540** | - |

**Key Advantage:** Our system has zero platform fees. You pay only for WhatsApp conversations (which all platforms also charge) and optional AI composition. Commercial platforms add INR 999-2,499/month in subscription fees on top of the same WhatsApp charges.

---

## 6. Development Value Assessment

### Codebase Metrics

| Metric | Value |
|---|---|
| Total lines of code | 1,615 |
| Source files | 8 (.gs files) |
| Functions | 41 (29 public, 12 private) |
| Notification types | 9 (daily, 6 change types, override, test) |
| API integrations | 2 (WhatsApp Cloud API, Claude API) |
| Sheet tabs | 5 (Students, Schedule, Config, Log, Overrides) |
| Trigger types | 3 (time-driven, onEdit, web app) |
| REST endpoints | 10 (7 GET, 3 POST) |

### Feature Breakdown

| Feature | Description |
|---|---|
| Daily scheduling | Automated morning notifications with class details |
| Real-time change detection | Instant alerts for teacher, room, time, date, and status changes |
| AI-powered composition | Context-aware message generation via Claude API |
| Fallback templates | 8 hardcoded templates when AI is disabled/unavailable |
| Manual overrides | Emergency broadcasts to class, student, or all |
| Config caching | CacheService with 10-minute TTL for performance |
| Rate limiting | 200ms spacing to prevent API throttling |
| Delivery logging | Complete audit trail of every message sent |
| Email summaries | Automatic email reports after batch operations |
| Phone normalization | Handles Indian number formats (10-digit, 0-prefix, +91, 91) |
| Error handling | Try-catch on all API calls with graceful fallbacks |
| Web API | 10 REST endpoints for remote management |

### Market Value Estimate

Based on Indian freelance/agency rates for comparable custom WhatsApp automation solutions:

| Valuation Method | Estimate (INR) |
|---|---|
| Per-function pricing (41 functions x INR 3,000-5,000) | INR 1,23,000 - 2,05,000 |
| Per-LOC industry rate (1,615 LOC x INR 100-200) | INR 1,61,500 - 3,23,000 |
| Fixed-project agency quote (WhatsApp automation) | INR 1,50,000 - 3,00,000 |
| SaaS alternative (Wati/Interakt, 3-year license) | INR 36,000 - 90,000 |

**Estimated development value: INR 1,50,000 - 3,00,000**

This accounts for system design, API integration, error handling, edge case management, documentation, and testing. The system is production-grade and immediately deployable.

---

## 7. Return on Investment

### Scenario: 50 Students, 1 Year

| Item | Cost (INR) |
|---|---|
| Development (one-time) | 1,50,000 - 3,00,000 |
| WhatsApp messages (Year 1) | 6,300 |
| Claude AI (optional, Year 1) | 3,240 |
| Infrastructure (Year 1) | 0 |
| **Total Year 1** | **1,56,300 - 3,09,540** |
| **Recurring Annual Cost (no Claude)** | **6,300** |
| **Recurring Annual Cost (with Claude)** | **9,540** |

### Comparison: Commercial Platform Over 3 Years

| Solution | Year 1 | Year 2 | Year 3 | 3-Year Total |
|---|---|---|---|---|
| Wati subscription | INR 30,000 | INR 30,000 | INR 30,000 | INR 90,000 |
| Interakt subscription | INR 12,000 | INR 12,000 | INR 12,000 | INR 36,000 |
| Our system (recurring only, no Claude) | INR 6,300 | INR 6,300 | INR 6,300 | INR 18,900 |
| Our system (recurring only, with Claude) | INR 9,540 | INR 9,540 | INR 9,540 | INR 28,620 |

**After the initial development investment, recurring costs are 47-79% lower than commercial platforms.**

### Qualitative Benefits

- **Full ownership**: No vendor lock-in. The code and data belong to Muzigal.
- **Customization**: Every notification type, template, and trigger can be modified without platform constraints.
- **Data privacy**: Student data stays in the academy's own Google Sheet. No third-party platform has access to student phone numbers.
- **Scalability**: The system can handle 500+ students within Google Apps Script's free tier.
- **AI-ready**: Claude integration can be toggled on for premium, personalized messages at minimal cost.

---

## 8. Cost Optimization Tips

### Immediate Savings

1. **Disable Claude AI** (`USE_CLAUDE=FALSE`): Eliminates INR 135-2,700/month in API costs. The fallback templates are professional and fully functional.
2. **Batch schedule entries**: Combine multiple classes on the same day into fewer schedule rows where possible. Each student receives one combined message instead of multiple.
3. **Use template caching**: The system already caches config values for 10 minutes. No additional action needed.

### Medium-Term Optimizations

4. **WhatsApp template design**: Design templates that pack maximum information per message. Each conversation window (24 hours) allows unlimited follow-up messages for free.
5. **Schedule only active days**: Only add schedule entries for days classes actually occur. This prevents the system from checking empty days.
6. **Deactivate inactive students**: Set `Active = FALSE` for students who have paused or dropped classes. They will be excluded from all notifications.

### Advanced Optimizations

7. **Claude prompt optimization**: If using Claude, keep the system prompt short and the context JSON minimal. Every token saved reduces costs.
8. **Consider Claude Haiku**: For simpler messages, Anthropic's Haiku model costs significantly less than Sonnet while still producing good results. This requires a one-line code change in `composer.gs`.
9. **Monitor the Log tab**: Review the Log tab periodically. Repeated failures to the same phone number indicate an invalid number that should be corrected or deactivated.
10. **Consolidate change alerts**: If multiple schedule columns are changed simultaneously (e.g., teacher and room), the onEdit trigger fires once per cell. Consider batch-editing outside the sheet and using the override endpoint instead.

---

## 9. Cost Summary

| Cost Category | Monthly (50 students) | Annual (50 students) |
|---|---|---|
| Google Apps Script | INR 0 | INR 0 |
| Google Sheets | INR 0 | INR 0 |
| WhatsApp messages (daily only) | INR 525 | INR 6,300 |
| Claude AI (optional) | INR 270 | INR 3,240 |
| **Total (without Claude)** | **INR 525** | **INR 6,300** |
| **Total (with Claude)** | **INR 795** | **INR 9,540** |

The system delivers enterprise-grade WhatsApp automation at a fraction of commercial platform pricing, with zero infrastructure costs and full data ownership.

---

*Document generated for Muzigal Musical Academy by Aldrin Stellus.*
