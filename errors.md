──(jacobp㉿jacob-hpelitebookx3601030g2)-[~/Desktop/Projecs/hirehub-backend]
└─$] bun run dev
$ tsx watch src/app/server.ts
[Audit] Failed to log event: PrismaClientKnownRequestError: 
Invalid `prisma.auditEvent.create()` invocation in
/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:31

  52 
  53 async logEvent(input: AuditEventInput): Promise<void> {
  54   try {
→ 55     await prisma.auditEvent.create(
The table `public.audit_events` does not exist in the current database.
    at $n.handleRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:7315)
    at $n.handleAndLogRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6623)
    at $n.request (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6307)
    at async l (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:130:9633)
    at async AuditService.logEvent (/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:7) {
  code: 'P2021',
  clientVersion: '5.22.0',
  meta: { modelName: 'AuditEvent', table: 'public.audit_events' }
}
[Audit] Failed to log event: PrismaClientKnownRequestError: 
Invalid `prisma.auditEvent.create()` invocation in
/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:31

  52 
  53 async logEvent(input: AuditEventInput): Promise<void> {
  54   try {
→ 55     await prisma.auditEvent.create(
The table `public.audit_events` does not exist in the current database.
    at $n.handleRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:7315)
    at $n.handleAndLogRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6623)
    at $n.request (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6307)
    at async l (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:130:9633)
    at async AuditService.logEvent (/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:7) {
  code: 'P2021',
  clientVersion: '5.22.0',
  meta: { modelName: 'AuditEvent', table: 'public.audit_events' }
}
{"level":50,"time":1785314431874,"pid":15896,"hostname":"jacob-hpelitebookx3601030g2","err":{"type":"PrismaClientKnownRequestError","message":"\nInvalid `prisma.user.findUnique()` invocation in\n/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/auth/auth.service.ts:12:40\n\n   9 \n  10 export class AuthService {\n  11   async register(data: { name: string; email: string; password: string; role?: string; companyName?: string }) {\n→ 12     const existing = await prisma.user.findUnique(\nThe column `User.phone` does not exist in the current database.","stack":"PrismaClientKnownRequestError: \nInvalid `prisma.user.findUnique()` invocation in\n/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/auth/auth.service.ts:12:40\n\n   9 \n  10 export class AuthService {\n  11   async register(data: { name: string; email: string; password: string; role?: string; companyName?: string }) {\n→ 12     const existing = await prisma.user.findUnique(\nThe column `User.phone` does not exist in the current database.\n    at $n.handleRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:7315)\n    at $n.handleAndLogRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6623)\n    at $n.request (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6307)\n    at async l (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:130:9633)\n    at async AuthService.register (/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/auth/auth.service.ts:12:22)\n    at async register (/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/auth/auth.controller.ts:26:20)","name":"PrismaClientKnownRequestError","code":"P2022","clientVersion":"5.22.0","meta":{"modelName":"User","column":"User.phone"}},"msg":"Prisma error P2022"}
[Audit] Failed to log event: PrismaClientKnownRequestError: 
Invalid `prisma.auditEvent.create()` invocation in
/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:31

  52 
  53 async logEvent(input: AuditEventInput): Promise<void> {
  54   try {
→ 55     await prisma.auditEvent.create(
The table `public.audit_events` does not exist in the current database.
    at $n.handleRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:7315)
    at $n.handleAndLogRequestError (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6623)
    at $n.request (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:121:6307)
    at async l (/home/jacobp/Desktop/Projecs/hirehub-backend/node_modules/@prisma/client/runtime/library.js:130:9633)
    at async AuditService.logEvent (/home/jacobp/Desktop/Projecs/hirehub-backend/src/modules/audit/audit.service.ts:55:7) {
  code: 'P2021',
  clientVersion: '5.22.0',
  meta: { modelName: 'AuditEvent', table: 'public.audit_events' }
}

