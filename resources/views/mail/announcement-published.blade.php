<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
                    <tr>
                        <td style="padding:28px 28px 12px;background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#ffffff;">
                            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">{{ $appName }}</p>
                            <h1 style="margin:0;font-size:24px;line-height:1.3;">New Announcement</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @if($recipientName)
                                <p style="margin:0 0 16px;font-size:15px;">Hello {{ $recipientName }},</p>
                            @endif
                            <h2 style="margin:0 0 12px;font-size:20px;color:#18181b;">{{ $title }}</h2>
                            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;white-space:pre-wrap;">{{ $message }}</p>
                            @if($publishedAt)
                                <p style="margin:0;font-size:13px;color:#71717a;">Published on {{ $publishedAt }}</p>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 28px 24px;border-top:1px solid #f4f4f5;">
                            <p style="margin:0;font-size:12px;color:#a1a1aa;">You received this email because your school administrator published an announcement.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
