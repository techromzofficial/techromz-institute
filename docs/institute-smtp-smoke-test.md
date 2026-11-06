# Institute controlled SMTP smoke test

This operator procedure sends one diagnostic email only. It does not import database code, create a contact challenge, register a student, issue a certificate or change feature gates.

## Preconditions

- Run from a trusted interactive terminal in the application directory.
- Use an explicitly approved recipient controlled by the operator.
- Confirm outbound TCP 465 is permitted from the intended Hostinger application runtime or staging shell.
- Keep `INSTITUTE_REGISTRATION_ENABLED=false`, `INSTITUTE_PAYMENT_ENABLED=false`, `INSTITUTE_ADMIN_ENABLED=false` and `INSTITUTE_SEAT_AVAILABILITY_ENABLED=false`.
- Obtain the mailbox password from the approved secret source immediately before the test. Do not place it in shell history, environment files or command arguments.

## Dry run

```sh
cd '/Users/techromz/Techromz Institute/frontend'
npm run smtp:diagnostic
```

The dry run performs no network or database operation and must report `sendsEmail: false`.

## One authorized delivery

Only after separate approval to send one real test email, run:

```sh
cd '/Users/techromz/Techromz Institute/frontend'
npm run smtp:diagnostic -- --send
```

The script then:

1. requires an interactive TTY;
2. prompts for one approved recipient;
3. accepts the Hostinger mailbox password through hidden terminal input;
4. displays an exact recipient-specific confirmation phrase;
5. sends one message only after the phrase matches exactly;
6. performs no automatic retry.

The message subject is `[SMTP TEST] Techromz Institute controlled delivery test`. The body states that it is not a registration, verification, enrolment or certificate message.

## Evidence to record privately

- UTC test time;
- operator and approval/change reference;
- approved recipient domain (avoid copying the full address into broad logs);
- whether Hostinger accepted the message;
- inbox or spam-folder arrival and approximate latency;
- authentication, TLS, timeout or rejection outcome.

Never record the mailbox password. Stop after the single attempt even if delivery fails; investigate before authorizing another attempt.
