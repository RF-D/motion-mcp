# Contributing to Motion MCP Server

Thank you for your interest in contributing to the Motion MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Search existing issues to avoid duplicates
2. Use the issue templates when available
3. Provide clear reproduction steps
4. Include relevant system information

### Suggesting Features

1. Check the issues/discussions for similar suggestions
2. Open a discussion before implementing major features
3. Clearly describe the use case and benefits
4. Consider backward compatibility

### Pull Requests

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/motion-mcp.git
   cd motion-mcp
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add/update tests as needed
   - Update documentation
   - Ensure TypeScript types are correct

4. **Test Your Changes**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   npm test # if tests exist
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
   
   Follow conventional commits:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Maintenance tasks

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Setup

1. **Prerequisites**
   - Node.js >= 20.0.0
   - npm or yarn
   - Motion API key for testing

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your Motion API key to .env
   ```

3. **Development Commands**
   - `npm run dev` - Start development server
   - `npm run build` - Build for production
   - `npm run typecheck` - Check TypeScript types
   - `npm run lint` - Run ESLint
   - `npm run format` - Format with Prettier

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing code structure
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer composition over inheritance

### Testing Guidelines

- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions
- Mock external API calls
- Use descriptive test names

### Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update API documentation
- Include examples for new features

## Project Structure

```
src/
├── api/         # API client implementation
├── tools/       # MCP tool implementations
├── types/       # TypeScript type definitions
├── config.ts    # Configuration management
└── index.ts     # Main entry point
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a PR with version bump
4. After merge, tag the release
5. Publish to npm

## Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing documentation
- Ask in the MCP community

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing to Motion MCP Server!