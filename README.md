# Motion MCP Server

**Unofficial** Model Context Protocol (MCP) server for [Motion](https://www.usemotion.com/) - the AI-powered calendar, task management, and project planning app that automatically schedules your work. 

> **Note**: This is a community-built integration, not an official Motion product. We created this MCP server because there was no official implementation available, enabling AI assistants like Claude to interact with Motion's powerful scheduling and task management features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Version](https://img.shields.io/badge/MCP-1.0.4-blue)](https://modelcontextprotocol.io)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-green)](https://nodejs.org)

## Quick Start

### Step 1: Get Your Motion API Key

1. Log into [Motion](https://usemotion.com)
2. Navigate to Settings → API
3. Create a new API key
4. Copy the key immediately (it's only shown once!)

### Step 2: Install the MCP Server

Run this command to add the Motion MCP server to Claude:

```bash
claude mcp add motion npx -- -y @rf-d/motion-mcp
```

### Step 3: Add Your API Key

The above command creates the configuration, but you need to manually add your API key:

1. Open your Claude configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

2. Find the `motion` entry that was just added and update it to include your API key:

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["-y", "@rf-d/motion-mcp"],
      "env": {
        "MOTION_API_KEY": "your_motion_api_key_here"
      }
    }
  }
}
```

3. Save the file and restart Claude Desktop

### Alternative Installation Methods

#### Via GitHub (Development)
```bash
git clone https://github.com/RF-D/motion-mcp.git
cd motion-mcp
npm install
npm run build

# Create a .env file with your API key
echo "MOTION_API_KEY=your_motion_api_key_here" > .env

# Run in development mode
npm run dev
```

**For development version, add this to your `claude_desktop_config.json` configuration:**

```json
{
  "mcpServers": {
    "motion": {
      "command": "npm",
      "args": [
        "--prefix",
        "/path/to/your/motion-mcp",
        "--silent",
        "run",
        "start"
      ],
      "env": {
        "MOTION_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Replace `/path/to/your/motion-mcp` with the actual path to your cloned repository.

#### Manual Configuration
If you prefer to manually configure without using the CLI, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "motion": {
      "command": "npx",
      "args": ["-y", "@rf-d/motion-mcp"],
      "env": {
        "MOTION_API_KEY": "your_motion_api_key_here",
        "MOTION_RATE_LIMIT_PER_MINUTE": "12"  // 12 for individual, 120 for teams
      }
    }
  }
}
```

## Features

### Core Capabilities

- **Task Management**: Create, update, delete, and organize tasks with full support for Motion's auto-scheduling
- **Project Management**: Create and view projects across workspaces (Note: Projects are read-only once created)
- **Workspace Organization**: Access and manage multiple workspaces
- **Team Collaboration**: User management, task assignment, and team coordination
- **Comments**: Add and manage task comments for better collaboration
- **Scheduling**: View and manage schedules with Motion's intelligent scheduling
- **Custom Fields**: Create and manage custom fields for tasks and projects
- **Recurring Tasks**: Set up and manage recurring tasks with flexible patterns

### Rate Limiting

The server includes automatic rate limiting to comply with Motion's API limits:
- **Individual accounts**: 12 requests per minute
- **Team accounts**: 120 requests per minute
- **Enterprise accounts**: Custom limits

## Available Tools

### Task Management (8 tools)
- `motion_list_tasks` - List tasks with filtering and pagination
- `motion_get_task` - Get detailed task information
- `motion_create_task` - Create new tasks with auto-scheduling
- `motion_update_task` - Update task properties
- `motion_delete_task` - Delete tasks
- `motion_move_task` - Move tasks between projects
- `motion_complete_task` - Mark tasks as completed
- `motion_uncomplete_task` - Mark tasks as not completed

### Project Management (3 tools)
- `motion_list_projects` - List all projects
- `motion_get_project` - Get project details
- `motion_create_project` - Create new projects

### Workspace Tools (2 tools)
- `motion_list_workspaces` - List accessible workspaces
- `motion_get_workspace` - Get workspace details

### Additional Tools (19 tools)
- User management (3 tools)
- Schedule management (1 tool)
- Comment management (5 tools)
- Custom field management (5 tools)
- Recurring task management (5 tools)

## Usage Examples

### Basic Task Creation
```
Create a new task called "Review Q4 reports" due tomorrow with high priority
```

### Advanced Task Management
```
List all my incomplete tasks in the "Development" project and move any bug fixes to high priority
```

### Team Collaboration
```
Show me all tasks assigned to the team this week and add a comment to each one about the sprint goals
```

### Recurring Tasks
```
Create a weekly recurring task for team standup meetings every Monday at 9 AM
```

## Development

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn
- Motion API key

### Setup
```bash
# Clone the repository
git clone https://github.com/RF-D/motion-mcp.git
cd motion-mcp

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key

# Run in development mode
npm run dev
```

### Scripts
- `npm run build` - Build for production
- `npm run dev` - Development mode with hot reload
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint code linting
- `npm run format` - Prettier code formatting

### Project Structure
```
src/
├── api/
│   └── client.ts          # Motion API client with rate limiting
├── tools/
│   ├── task.ts           # Task management tools
│   ├── project.ts        # Project management tools
│   ├── workspace.ts      # Workspace tools
│   └── ...               # Other tool categories
├── types/
│   ├── motion.ts         # Motion API type definitions
│   └── tool.ts           # MCP tool type definitions
├── config.ts             # Configuration management
└── index.ts              # Main server entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass
- Code follows the existing style
- TypeScript types are properly defined
- Documentation is updated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Motion API Documentation](https://docs.usemotion.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Motion Website](https://usemotion.com)

## Disclaimer

This is an unofficial integration and is not affiliated with, officially maintained, or endorsed by Motion. Use at your own discretion.

## Troubleshooting

### Common Issues

**"Motion API key not found" error**
- Make sure you've added the `MOTION_API_KEY` to your claude_desktop_config.json configuration
- Verify the key is correct and hasn't expired
- Restart Claude Desktop after adding the key

**"Rate limit exceeded" error**
- Individual accounts are limited to 12 requests per minute
- Team accounts get 120 requests per minute
- The server automatically handles rate limiting, but very heavy usage may still hit limits

**"Command not found" error**
- Make sure you have Node.js >= 20.0.0 installed
- Try running with the full path: `npx @rf-d/motion-mcp`

## Support

- **Issues**: [GitHub Issues](https://github.com/RF-D/motion-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RF-D/motion-mcp/discussions)
- **NPM Package**: [npmjs.com/package/@rf-d/motion-mcp](https://www.npmjs.com/package/@rf-d/motion-mcp)

---

Built with love for the Motion and MCP communities