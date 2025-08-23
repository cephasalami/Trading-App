# Gemini CLI Development Rules

## 🔥 CRITICAL: Supabase MCP Usage
**IMPORTANT: You must use the Supabase MCP server tools for all database operations. Instead, use the available MCP functions to interact with the live Supabase database. If you need to check table structure, query data, or perform any database operations, use only the MCP server tools that are connected.**

- Use MCP tools only - no code analysis for database operations
- Query the live Supabase database using the connected MCP server
- Do not write direct SQL queries or examine local database files
- Always verify table structure and data using MCP server functions first

---


## Database Operations Reminder
**When working with database operations, always start your request with: "Using the Supabase MCP server tools, please..." and specify exactly what database operation you need performed on the live database.**