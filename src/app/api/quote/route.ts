// src/app/api/quote/route.ts

// Import necessary modules from Next.js server
import { NextRequest, NextResponse } from 'next/server';

// Import D1Database type from Cloudflare Workers Types
// IMPORTANT:
// 1. Make sure you have installed this package as a dev dependency:
//    npm install --save-dev @cloudflare/workers-types
// 2. Make sure you have created an environment.d.ts file (e.g., in src/types/)
//    with the following content to augment process.env:
//    import type { D1Database } from '@cloudflare/workers-types';
//    declare global { namespace NodeJS { interface ProcessEnv { DB: D1Database; } } }
import type { D1Database } from '@cloudflare/workers-types';

// Set the runtime to Edge. This is required for using Cloudflare bindings like D1.
export const runtime = 'edge';

// Define the expected structure of the quote object to be returned by this API.
// D1 returns null for database NULL values, so author is string | null.
interface Quote {
  text: string;
  author: string | null; // D1 returns null, not undefined, for NULL values
}

// Define the GET handler function for this API route.
// This function will run on the Edge runtime.
export async function GET(request: NextRequest) {
  // Access the D1 binding via process.env.
  // The environment.d.ts file tells TypeScript that process.env.DB exists
  // and is of type D1Database. We use a type assertion here.
  const db = process.env.DB as D1Database;

  // Check if the D1 binding is available.
  // This is a safety check, though the type error should be gone with environment.d.ts.
  if (!db) {
     console.error("D1 binding 'DB' not found in process.env.");
     return NextResponse.json(
       { error: 'Database binding not configured.' },
       { status: 500 }
     );
  }

  try {
    // Execute the D1 query to get a random quote.
    // The .all() method returns an object with a 'results' property, which is an array
    // of rows. By default, TypeScript might infer the row type as Record<string, unknown>.
    const { results } = await db.prepare(
      'SELECT text, author FROM quotes ORDER BY RANDOM() LIMIT 1;'
    ).all();

    // Check if the query returned any results.
    if (!results || results.length === 0) {
      // If no quote is found (e.g., table is empty)
      return NextResponse.json(
        { error: 'No quote found in the database.' },
        { status: 404 }
      );
    }

    // Get the first row from the results array.
    // We use 'as unknown as Quote' to perform a two-step type assertion.
    // This tells TypeScript that although the default type of results[0]
    // is less specific (like Record<string, unknown>), we are confident
    // that it conforms to the Quote interface based on our SQL query.
    const row = results[0] as unknown as Quote;

    // Return the quote data as a JSON response.
    // NextResponse.json automatically sets the Content-Type header to application/json.
    return NextResponse.json(row, {
       headers: { 'Content-Type': 'application/json' }, // Explicitly setting header is optional with NextResponse.json but doesn't hurt
    });

  } catch (err: any) {
    // Catch and handle any errors that occur during the database operation.
    console.error("Error fetching quote from D1:", err); // Log the error details
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Note: If you installed @cloudflare/workers-types correctly and configured
// your tsconfig.json (which yours seems to be), you don't need to
// define the D1Database interface manually here.
// interface D1Database { ... }