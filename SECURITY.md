# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take the security of BetterQuake seriously. If you discover a security vulnerability, please follow these steps:

### Where to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by:
1. Sending an email to: **[INSERT YOUR SECURITY EMAIL]**
2. Using GitHub's Security Advisory feature (if available)

### What to Include

Please include the following information in your report:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Investigation**: We'll investigate and validate the report within 7 days
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We'll work on a fix and coordinate disclosure
- **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)

## 🛡️ Security Measures

BetterQuake implements several security measures:

### API Security

- **Rate Limiting**: All API endpoints are rate-limited to prevent abuse
  - `/api/phivolcs/latest`: 20 requests per 5 minutes per IP
  - `/api/phivolcs/details`: 30 requests per 5 minutes per IP

- **Input Validation**: All user inputs are validated and sanitized
- **HTTPS Only**: Production deployments should use HTTPS
- **No Sensitive Data**: No personal data is collected or stored

### Data Security

- **No Authentication Required**: Public data only, no user accounts
- **Client-Side Caching**: Uses localStorage for performance (no sensitive data)
- **No Database**: Stateless API, no data persistence on server

### Dependencies

- Regular dependency updates via Dependabot
- Automated security scanning
- Minimal dependency footprint

## 🔐 Best Practices for Deployment

When deploying BetterQuake, follow these security best practices:

### Environment Security

```bash
# Always use HTTPS in production
# Set secure headers
# Enable CORS appropriately
# Use environment variables for any sensitive config
```

### Rate Limiting

```typescript
// Adjust rate limits based on your needs
const RATE_LIMIT_CONFIG = {
  interval: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 20,           // Adjust as needed
};
```

### Reverse Proxy

If deploying behind a reverse proxy (nginx, Apache, etc.), ensure:

- `X-Forwarded-For` header is properly configured
- Real IP addresses are passed through for rate limiting
- SSL/TLS termination is handled correctly

### Network Security

- Use a firewall to restrict unnecessary ports
- Implement DDoS protection
- Monitor unusual traffic patterns
- Consider using a CDN for additional protection

## 🚫 Out of Scope

The following are **NOT** considered security vulnerabilities:

- Rate limit bypass using multiple IPs (expected behavior)
- Client-side cache manipulation (no sensitive data)
- Scraping data from PHIVOLCS (public data source)
- Missing security headers on static files
- Reports without clear security impact

## 📋 Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded secrets or API keys
- [ ] Input validation implemented
- [ ] No SQL injection vectors (we don't use SQL, but still...)
- [ ] XSS prevention in place
- [ ] Dependencies up to date
- [ ] Rate limiting not bypassed
- [ ] Error messages don't leak sensitive info

## 🔄 Security Update Process

When a security vulnerability is confirmed:

1. **Patch Development**: Create fix in private repository
2. **Testing**: Thoroughly test the fix
3. **Release**: Deploy security update
4. **Disclosure**: Publish security advisory
5. **Communication**: Notify users if action is required

## 📝 Security Advisories

Past security advisories will be published in:
- GitHub Security Advisories
- CHANGELOG.md
- Release notes

## 🆘 Emergency Contacts

For urgent security issues:
- **Email**: [INSERT YOUR EMAIL]
- **Response Time**: Within 24 hours for critical issues

## 🙏 Acknowledgments

We appreciate the security research community's efforts to keep BetterQuake secure. Researchers who responsibly disclose vulnerabilities will be credited in:

- Security advisories
- CHANGELOG.md
- Hall of Fame (if implemented)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

**Last Updated**: November 2025

Thank you for helping keep BetterQuake and its users safe! 🙏

