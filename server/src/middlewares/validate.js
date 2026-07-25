const { z } = require('zod');
const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const errors = issues.map((e) => ({
        field: (e.path || []).join('.'),
        message: e.message,
      }));
      throw new BadRequestError(
        `Validation error: ${errors.map((e) => e.message).join(', ') || 'Invalid request.'}`,
      );
    }
    next(err);
  }
};

// Auth validation schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['student', 'provider']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(20, 'Google credential is required'),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().min(4, 'Verification code is required').max(8),
  }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

// Scholarship validation schemas
const createScholarshipSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(20, 'Description must be at least 20 characters').max(10000),
    shortDescription: z.string().max(300).optional(),
    country: z.string().min(1, 'Country is required'),
    level: z.enum(['high-school', 'bachelors', 'masters', 'phd', 'postdoc', 'any']),
    field: z.string().min(1, 'Field of study is required'),
    eligibility: z.string().optional(),
    fundingType: z.enum(['full', 'partial', 'tuition', 'stipend', 'travel', 'research']),
    amount: z.object({
      value: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
    deadline: z.string().refine((date) => new Date(date) > new Date(), {
      message: 'Deadline must be in the future',
    }),
    applicationUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    isEarlyAccess: z.boolean().optional(),
  }),
});

const updateScholarshipSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).max(10000).optional(),
    shortDescription: z.string().max(300).optional(),
    country: z.string().optional(),
    level: z.enum(['high-school', 'bachelors', 'masters', 'phd', 'postdoc', 'any']).optional(),
    field: z.string().optional(),
    eligibility: z.string().optional(),
    fundingType: z.enum(['full', 'partial', 'tuition', 'stipend', 'travel', 'research']).optional(),
    amount: z.object({
      value: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
    deadline: z.string().optional(),
    applicationUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    isEarlyAccess: z.boolean().optional(),
  }),
});

// Application validation
const createApplicationSchema = z.object({
  body: z.object({
    scholarshipId: z.string().min(1, 'Scholarship ID is required'),
    personalStatement: z.string().max(5000).optional(),
    motivation: z.string().max(3000).optional(),
    steps: z.array(z.object({
      stepNumber: z.number(),
      title: z.string(),
      data: z.record(z.any()).optional(),
      completed: z.boolean().optional(),
    })).optional(),
  }),
});

// Profile update validation
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    profile: z.object({
      country: z.string().optional(),
      dateOfBirth: z.string().optional(),
      phone: z.string().optional(),
      bio: z.string().max(500).optional(),
      educationLevel: z.enum(['high-school', 'bachelors', 'masters', 'phd', 'postdoc', '']).optional(),
      fieldOfStudy: z.string().optional(),
      institution: z.string().optional(),
      gpa: z.number().min(0).max(4.0).optional(),
      interests: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
    }).optional(),
  }),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  googleAuthSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  createScholarshipSchema,
  updateScholarshipSchema,
  createApplicationSchema,
  updateProfileSchema,
};
