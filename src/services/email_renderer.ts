import { marked } from 'marked';

/**
 * Design Tokens & CSS
 * Edit these to change the look and feel of the email.
 */
const EMAIL_STYLES = `
<style>
    /* Base Typography & Reset */
    body {
        margin: 0;
        padding: 0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        line-height: 1.8;
        color: #2D3748;
        background-color: #F7FAFC;
        -webkit-font-smoothing: antialiased;
    }
    
    /* Layout Container */
    .wrapper {
        width: 100%;
        background-color: #F7FAFC;
        padding: 40px 0;
    }
    .container {
        max-width: 680px;
        margin: 0 auto;
        background-color: #FFFFFF;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    /* Main Content Body */
    .content {
        padding: 50px 40px;
    }
    .content h2 {
        font-size: 22px;
        font-weight: 800;
        color: #1A202C;
        margin-top: 40px;
        margin-bottom: 20px;
        border-left: 4px solid #1A202C;
        padding-left: 15px;
    }
    .content h3 {
        font-size: 19px;
        font-weight: 700;
        color: #2D3748;
        margin-top: 30px;
    }
    .content p {
        margin-bottom: 1.5em;
        font-size: 17px;
        color: #4A5568;
    }

    /* Expert Insight Card */
    .insight-card {
        background-color: #EBF8FF;
        border-radius: 8px;
        padding: 25px;
        margin: 40px 0;
        border: 1px solid #BEE3F8;
    }
    .insight-label {
        color: #2B6CB0;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: block;
        margin-bottom: 10px;
    }
    .insight-body {
        font-size: 16px;
        color: #2C5282;
        font-style: italic;
    }

    /* Footer Details */
    .footer {
        background-color: #EDF2F7;
        padding: 40px;
        text-align: center;
        font-size: 14px;
        color: #718096;
    }
    .footer a {
        color: #4A5568;
        text-decoration: none;
        border-bottom: 1px solid #CBD5E0;
    }

    /* Button Action */
    .cta-button {
        display: inline-block;
        background-color: #2D3748;
        color: #FFFFFF !important;
        padding: 16px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 700;
        margin: 30px 0;
        transition: background 0.2s;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
        .content { padding: 30px 20px; }
        .header { padding: 40px 20px; }
        .header h1 { font-size: 24px; }
    }
</style>
`;

export function renderEmail(
    channelName: string,
    videoTitle: string,
    markdownContent: string,
    videoUrl?: string
): string {
    // 1. Extract Video ID for Thumbnail
    let videoId = '';
    if (videoUrl) {
        const urlMatch = videoUrl.match(/(?:v=|\/embed\/|\/1.1\/|youtu\.be\/)([^"&?\/\s]{11})/);
        videoId = urlMatch ? urlMatch[1] : '';
    }
    const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';

    // 2. Process Markdown
    let htmlContent = marked.parse(markdownContent) as string;

    // 3. Custom block transformations (e.g., Expert Insight)
    // Looking for blockquotes that started as > **💡 Expert Insight**
    const expertInsightRegex = /<blockquote>\s*<p>\s*<strong>(.*Expert Insight.*)<\/strong>([\s\S]*?)<\/p>\s*<\/blockquote>/gi;
    htmlContent = htmlContent.replace(expertInsightRegex, (match, label, body) => {
        return `
            <div class="insight-card">
                <span class="insight-label">${label}</span>
                <div class="insight-body">${body}</div>
            </div>
        `;
    });

    // 4. Assemble the full template
    // Use the provided baseUrl for links, falling back to a default if not provided
    const base = 'https://readtube.jp';
    const privacyUrl = `${base}/privacy`;
    const unsubscribePlaceholder = `${base}/unsubscribe/TOKEN_PLACEHOLDER`;

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${videoTitle}</title>
    ${EMAIL_STYLES}
    <style>
        .hero-image {
            width: 100%;
            height: auto;
            display: block;
            border-bottom: 4px solid #F7FAFC;
        }
        .hero-container {
            position: relative;
            background-color: #000;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            ${thumbnailUrl ? `
            <div class="hero-container">
                <a href="${videoUrl}"><img src="${thumbnailUrl}" alt="Video Thumbnail" class="hero-image"></a>
            </div>
            ` : ''}

            <div class="content">
                ${htmlContent}
                
                ${videoUrl ? `
                <div style="text-align: center; margin-top: 50px;">
                    <a href="${videoUrl}" class="cta-button">元の動画で内容を確認する</a>
                </div>
                ` : ''}
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ReadTube Premium</p>
                <p style="margin: 10px 0; font-size: 14px; color: #718096;">
                    このメールは <strong>${channelName}</strong> チャンネルの定点観測レポートとしてお届けしています。
                </p>
                <p style="font-size: 13px;">
                    <a href="${unsubscribePlaceholder}">配信を停止する (Unsubscribe)</a> | <a href="${privacyUrl}">プライバシーポリシー</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}
