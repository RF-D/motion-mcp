import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerCommentTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_comments',
      description: 'List all comments for a specific task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to get comments for' },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        const comments = await client.listComments(validated.taskId);

        return {
          comments,
          count: comments.length,
        };
      },
    },
    {
      name: 'motion_create_comment',
      description: 'Add a new comment to a task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to comment on' },
          content: { type: 'string', description: 'Comment content' },
        },
        required: ['taskId', 'content'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          content: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.createComment(validated);
      },
    },
    {
      name: 'motion_get_comment',
      description: 'Get details of a specific comment',
      inputSchema: {
        type: 'object',
        properties: {
          commentId: { type: 'string', description: 'Comment ID to retrieve' },
        },
        required: ['commentId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          commentId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getComment(validated.commentId);
      },
    },
    {
      name: 'motion_update_comment',
      description: 'Update the content of an existing comment',
      inputSchema: {
        type: 'object',
        properties: {
          commentId: { type: 'string', description: 'Comment ID to update' },
          content: { type: 'string', description: 'New comment content' },
        },
        required: ['commentId', 'content'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          commentId: z.string().min(1),
          content: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.updateComment(validated.commentId, validated.content);
      },
    },
    {
      name: 'motion_delete_comment',
      description: 'Delete a comment permanently',
      inputSchema: {
        type: 'object',
        properties: {
          commentId: { type: 'string', description: 'Comment ID to delete' },
        },
        required: ['commentId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          commentId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.deleteComment(validated.commentId);
        return { success: true, message: `Comment ${validated.commentId} deleted successfully` };
      },
    },
  ];
}
