import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface Quote {
  text: string;
  author?: string | null;
}

export async function GET(
  req: NextRequest,
  context: { params: any }
) {
  const mock: Quote[] = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein' },
    { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '温故而知新，可以为师矣。', author: '孔子' }
  ];
  const random = mock[Math.floor(Math.random() * mock.length)];
  return NextResponse.json(random);
}