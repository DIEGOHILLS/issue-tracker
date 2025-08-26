import OpenAI from "openai";

let openai = null;
let apiKeyValid = false;
let rateLimitExceeded = false;
let lastRateLimitError = 0;
const RATE_LIMIT_COOLDOWN = 30000; // 30 seconds cooldown

// Initialize OpenAI client
const initializeOpenAI = () => {
  if (openai !== null) return;
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Validate API key format
  if (!apiKey || !apiKey.startsWith('sk-') || apiKey.length < 30) {
    console.warn('Invalid OpenAI API key format. Using mock functions.');
    apiKeyValid = false;
    return;
  }
  
  try {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    apiKeyValid = true;
    rateLimitExceeded = false;
    console.log('OpenAI client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error);
    apiKeyValid = false;
  }
};

// Check if we should use mock functions due to rate limits
const shouldUseMock = () => {
  if (rateLimitExceeded) {
    const now = Date.now();
    if (now - lastRateLimitError < RATE_LIMIT_COOLDOWN) {
      return true;
    }
    // Cooldown period over, reset rate limit flag
    rateLimitExceeded = false;
  }
  return !openai || !apiKeyValid;
};

// High-quality mock functions with realistic responses
const mockSummarizeIssue = async (description) => {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  
  if (!description || description.trim().length === 0) {
    return "No issue description provided for summarization.";
  }
  
  const sentences = description.split(/[.!?]/).filter(s => s.trim().length > 5);
  if (sentences.length === 0) {
    return "Issue description is too brief to summarize effectively.";
  }
  
  const mainIssue = sentences[0].trim();
  const hasDetails = sentences.length > 1;
  
  return `Summary: ${mainIssue}${mainIssue.endsWith('.') ? '' : '.'}${hasDetails ? ' Additional technical details available in full description.' : ''}`;
};

const mockSuggestFix = async (description) => {
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 600));
  
  if (!description || description.trim().length === 0) {
    return "Please provide an issue description to suggest appropriate technical fixes.";
  }
  
  const lowerDesc = description.toLowerCase();
  const suggestions = [];
  
  // Context-aware suggestions based on issue content
  if (lowerDesc.includes('error') || lowerDesc.includes('exception') || lowerDesc.includes('crash')) {
    suggestions.push('Examine application logs for specific error codes and stack traces');
    suggestions.push('Implement comprehensive error handling with try-catch blocks');
    suggestions.push('Validate all input parameters and data types before processing');
    suggestions.push('Check for null or undefined references in the code execution path');
  }
  
  if (lowerDesc.includes('slow') || lowerDesc.includes('performance') || lowerDesc.includes('lag')) {
    suggestions.push('Use performance profiling tools to identify CPU/memory bottlenecks');
    suggestions.push('Implement caching mechanisms for frequently accessed data or API responses');
    suggestions.push('Review and optimize database queries with proper indexing strategies');
    suggestions.push('Consider implementing lazy loading for non-critical resources or components');
  }
  
  if (lowerDesc.includes('ui') || lowerDesc.includes('interface') || lowerDesc.includes('design')) {
    suggestions.push('Test across different browsers and devices for visual consistency');
    suggestions.push('Review CSS specificity and potential style conflicts or overrides');
    suggestions.push('Check JavaScript event handlers for proper binding and cleanup');
    suggestions.push('Verify responsive design breakpoints and mobile compatibility issues');
  }
  
  if (lowerDesc.includes('data') || lowerDesc.includes('database') || lowerDesc.includes('api')) {
    suggestions.push('Validate data integrity and implement consistency checks');
    suggestions.push('Review API rate limiting, authentication, and authorization mechanisms');
    suggestions.push('Check database connection pooling and query optimization strategies');
    suggestions.push('Implement proper data validation, sanitization, and encryption where needed');
  }
  
  // Default technical suggestions
  if (suggestions.length === 0) {
    suggestions.push('Review recent code changes and version control history for introduced issues');
    suggestions.push('Check system, application, and error logs for related warning or error messages');
    suggestions.push('Test with various input scenarios and edge cases to reproduce the issue consistently');
    suggestions.push('Verify all dependencies, libraries, and frameworks are updated and compatible');
    suggestions.push('Consider adding additional logging, monitoring, or debugging instrumentation');
  }
  
  return `Recommended technical actions:\n${suggestions.slice(0, 4).map(s => `• ${s}`).join('\n')}\n\nNote: These are general technical suggestions. Review your specific code context and architecture for appropriate solutions.`;
};

// Main exported functions with enhanced error handling
export const summarizeIssue = async (description) => {
  initializeOpenAI();
  
  if (shouldUseMock()) {
    return await mockSummarizeIssue(description);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a technical assistant that provides clear, concise summaries of software issues. Focus on identifying the core technical problem, main symptoms, and potential impact. Keep summaries technical, actionable, and avoid fluff." 
        },
        { 
          role: "user", 
          content: `Please provide a concise technical summary of this issue description: "${description.substring(0, 2000)}"` 
        }
      ],
      max_tokens: 120,
      temperature: 0.3
    });
    
    // Reset rate limit flag on successful API call
    rateLimitExceeded = false;
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.warn("OpenAI API error in summarizeIssue:", error.message);
    
    // Check for rate limit errors specifically
    if (error.status === 429 || error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
      rateLimitExceeded = true;
      lastRateLimitError = Date.now();
      console.warn('Rate limit exceeded. Using high-quality mock functions for next 30 seconds.');
    }
    
    return await mockSummarizeIssue(description);
  }
};

export const suggestFix = async (description) => {
  initializeOpenAI();
  
  if (shouldUseMock()) {
    return await mockSuggestFix(description);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a senior software engineer providing practical, actionable technical solutions. Focus on common fixes, best practices, and specific steps that can be taken. Consider different technical approaches and prioritize the most likely solutions based on software engineering principles." 
        },
        { 
          role: "user", 
          content: `Suggest specific, actionable technical fixes for this software issue: "${description.substring(0, 2000)}"` 
        }
      ],
      max_tokens: 180,
      temperature: 0.4
    });
    
    // Reset rate limit flag on successful API call
    rateLimitExceeded = false;
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.warn("OpenAI API error in suggestFix:", error.message);
    
    // Check for rate limit errors specifically
    if (error.status === 429 || error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
      rateLimitExceeded = true;
      lastRateLimitError = Date.now();
      console.warn('Rate limit exceeded. Using high-quality mock functions for next 30 seconds.');
    }
    
    return await mockSuggestFix(description);
  }
};

// Utility function to check API status
export const getApiStatus = () => {
  return {
    initialized: !!openai,
    apiKeyValid: apiKeyValid,
    rateLimitExceeded: rateLimitExceeded,
    rateLimitCooldown: rateLimitExceeded ? RATE_LIMIT_COOLDOWN - (Date.now() - lastRateLimitError) : 0
  };
};