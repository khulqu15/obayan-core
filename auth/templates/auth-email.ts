function baseEmailLayout(params: {
    previewText: string;
    brandName: string;
    title: string;
    subtitle?: string;
    contentHtml: string;
    footerNote?: string;
}) {
  return `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${params.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${params.previewText}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(17,24,39,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;font-weight:700;">
                  ${params.brandName}
                </div>
                <div style="font-size:28px;line-height:1.2;font-weight:800;margin-top:8px;">
                  ${params.title}
                </div>
                ${
                  params.subtitle
                    ? `<div style="font-size:15px;line-height:1.6;opacity:0.95;margin-top:10px;">${params.subtitle}</div>`
                    : ""
                }
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                ${params.contentHtml}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <div style="font-size:12px;line-height:1.7;color:#6b7280;">
                  ${params.footerNote ?? "Email ini dikirim otomatis oleh sistem. Mohon tidak membalas langsung ke email ini."}
                </div>
              </td>
            </tr>
          </table>

          <div style="max-width:640px;padding:16px 24px 0 24px;font-size:12px;color:#9ca3af;line-height:1.6;text-align:center;">
            © ${new Date().getFullYear()} ${params.brandName}. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

function primaryButton(label: string, href: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:12px;background:#2563eb;">
          <a href="${href}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function forgotPasswordEmailTemplate(params: {
  brandName: string;
  recipientName: string;
  resetUrl: string;
  expireMinutes: number;
}) {
  return baseEmailLayout({
    previewText: "Reset password akun Anda",
    brandName: params.brandName,
    title: "Reset Password",
    subtitle: "Kami menerima permintaan untuk mengatur ulang password akun Anda.",
    contentHtml: `
      <div style="font-size:15px;line-height:1.8;color:#374151;">
        Halo <strong>${params.recipientName}</strong>,
      </div>

      <div style="font-size:15px;line-height:1.8;color:#374151;margin-top:12px;">
        Klik tombol di bawah ini untuk membuat password baru. Link ini hanya berlaku selama
        <strong>${params.expireMinutes} menit</strong>.
      </div>

      ${primaryButton("Atur Ulang Password", params.resetUrl)}

      <div style="font-size:14px;line-height:1.8;color:#4b5563;margin-top:8px;">
        Jika tombol tidak bisa dibuka, salin link berikut ke browser Anda:
      </div>

      <div style="margin-top:10px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;word-break:break-all;font-size:13px;line-height:1.7;color:#2563eb;">
        ${params.resetUrl}
      </div>

      <div style="margin-top:20px;padding:14px 16px;background:#fff7ed;border:1px solid #fdba74;border-radius:12px;font-size:13px;line-height:1.7;color:#9a3412;">
        Jika Anda tidak merasa meminta reset password, abaikan email ini. Password Anda tidak akan berubah sebelum proses reset diselesaikan.
      </div>
    `,
  });
}

export function verifyEmailTemplate(params: {
  brandName: string;
  recipientName: string;
  verifyUrl: string;
  expireMinutes: number;
}) {
  return baseEmailLayout({
    previewText: "Verifikasi email akun Anda",
    brandName: params.brandName,
    title: "Verifikasi Email",
    subtitle: "Satu langkah lagi untuk mengaktifkan akun Anda.",
    contentHtml: `
      <div style="font-size:15px;line-height:1.8;color:#374151;">
        Halo <strong>${params.recipientName}</strong>,
      </div>

      <div style="font-size:15px;line-height:1.8;color:#374151;margin-top:12px;">
        Terima kasih telah mendaftar. Untuk mengaktifkan akun Anda, silakan verifikasi alamat email melalui tombol di bawah ini.
      </div>

      <div style="font-size:15px;line-height:1.8;color:#374151;margin-top:12px;">
        Link verifikasi ini berlaku selama
        <strong>${params.expireMinutes} menit</strong>.
      </div>

      ${primaryButton("Verifikasi Email", params.verifyUrl)}

      <div style="font-size:14px;line-height:1.8;color:#4b5563;margin-top:8px;">
        Jika tombol tidak bisa dibuka, salin link berikut ke browser Anda:
      </div>

      <div style="margin-top:10px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;word-break:break-all;font-size:13px;line-height:1.7;color:#2563eb;">
        ${params.verifyUrl}
      </div>

      <div style="margin-top:20px;padding:14px 16px;background:#ecfeff;border:1px solid #a5f3fc;border-radius:12px;font-size:13px;line-height:1.7;color:#155e75;">
        Jika Anda tidak merasa membuat akun, abaikan email ini. Akun tidak akan aktif sebelum email berhasil diverifikasi.
      </div>
    `,
  });
}

export function welcomeEmailTemplate(params: {
  brandName: string;
  recipientName: string;
  loginUrl: string;
}) {
  return baseEmailLayout({
    previewText: "Akun Anda berhasil dibuat",
    brandName: params.brandName,
    title: "Akun Berhasil Dibuat",
    subtitle: "Selamat datang di platform kami.",
    contentHtml: `
      <div style="font-size:15px;line-height:1.8;color:#374151;">
        Halo <strong>${params.recipientName}</strong>,
      </div>

      <div style="font-size:15px;line-height:1.8;color:#374151;margin-top:12px;">
        Akun Anda sudah berhasil dibuat dan siap digunakan.
      </div>

      ${primaryButton("Masuk ke Dashboard", params.loginUrl)}

      <div style="font-size:14px;line-height:1.8;color:#4b5563;">
        Pastikan Anda menyimpan email dan password dengan aman.
      </div>
    `,
  });
}