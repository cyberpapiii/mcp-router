# MCP Protocol Version Header

The MCP-Protocol-Version header is automatically handled by @modelcontextprotocol/sdk v1.25.1+.
No manual implementation required in mcp-router.

## Verification

The SDK transport layer handles:
- Client: Sends header via StreamableHTTPClientTransport.setProtocolVersion()
- Server: Validates header in WebStandardStreamableHTTPServerTransport.validateProtocolVersion()

## References
- MCP 2025-06-18 spec: https://modelcontextprotocol.io/specification/2025-06-18/changelog
