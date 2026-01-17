# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in notCringe, please report it responsibly.

### Please Do NOT:

- Open a public GitHub issue for security vulnerabilities
- Discuss the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond what's necessary for demonstration

### Please DO:

**Email us at:** security@notcringe.com (if set up)

**Or create a private security advisory:**

1. Go to the [Security tab](https://github.com/your-org/notcringe/security)
2. Click "Report a vulnerability"
3. Fill out the form with details

### What to Include:

1. **Description** - Clear explanation of the vulnerability
2. **Impact** - What an attacker could do
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Proof of Concept** - Code or screenshots (if applicable)
5. **Suggested Fix** - If you have ideas (optional)
6. **Your Contact Info** - So we can follow up

### Example Report:

```
Title: SQL Injection in /api/generate

Description:
The postText parameter in /api/generate is not properly sanitized,
allowing SQL injection attacks.

Impact:
An attacker could read or modify database contents.

Steps to Reproduce:
1. Send POST request to /api/generate
2. Set postText to: "'; DROP TABLE visitors; --"
3. Database table is deleted

Proof of Concept:
[Screenshot or code snippet]

Suggested Fix:
Use Prisma's parameterized queries instead of raw SQL.
```

## Response Timeline

We aim to respond to security reports within:

- **24 hours** - Initial acknowledgment
- **7 days** - Assessment and status update
- **30 days** - Fix deployed (for critical vulnerabilities)
- **90 days** - Public disclosure (after fix is released)

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**

   ```bash
   npm audit
   npm audit fix
   ```

2. **Use Environment Variables**
   - Never commit `.env` files
   - Use Vercel's encrypted environment variables
   - Rotate API keys regularly

3. **Enable Rate Limiting**
   - Implement in production (see DEPLOYMENT.md)

4. **Monitor Logs**
   - Check for suspicious activity
   - Set up alerts for errors

### For Contributors

1. **Input Validation**
   - Always validate user input with Zod
   - Sanitize outputs
   - Use parameterized queries (Prisma does this)

2. **Authentication & Authorization**
   - Check permissions before actions
   - Use secure session management
   - Implement rate limiting

3. **Dependencies**
   - Run `npm audit` regularly
   - Keep dependencies up to date
   - Review dependency licenses

4. **Secrets Management**
   - Never log API keys or secrets
   - Use environment variables
   - Rotate keys periodically

## Known Security Considerations

### Current (MVP)

- **No authentication** - API is open (planned for future)
- **No rate limiting** - Can be abused (planned for future)
- **Client-side rendering** - Some data exposed to client

### Mitigations in Place

- **Input validation** - Zod schemas prevent malformed requests
- **Safety filters** - Prevents generating harmful content
- **Prisma ORM** - SQL injection protection
- **Next.js security headers** - XSS, CSRF protection

### Planned Improvements

- [ ] API key authentication
- [ ] Rate limiting (Redis)
- [ ] CAPTCHA for public endpoints
- [ ] Abuse detection
- [ ] Content Security Policy headers
- [ ] Regular security audits

## Vulnerability Disclosure Process

1. **Report received** - We acknowledge within 24 hours
2. **Investigation** - We assess severity and impact
3. **Fix developed** - We create and test a patch
4. **Disclosure** - We coordinate disclosure timing with reporter
5. **Release** - We deploy fix and publish security advisory
6. **Credit** - We credit reporter (if desired) in CHANGELOG and advisory

## Security Hall of Fame

We appreciate responsible security researchers who help keep notCringe safe:

<!-- Contributors who report vulnerabilities will be listed here -->

## Bug Bounty Program

We currently do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities.

If you report a valid security issue:

- We will credit you in our CHANGELOG and security advisories (if you want)
- We will work with you to understand and fix the issue
- We will publicly thank you (if you want) when the fix is released

## Contact

- **Security Email:** security@notcringe.com (if set up)
- **GitHub Security Advisories:** [Create advisory](https://github.com/your-org/notcringe/security/advisories/new)
- **PGP Key:** (if set up)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

Thank you for helping keep notCringe and its users safe! 🔒
