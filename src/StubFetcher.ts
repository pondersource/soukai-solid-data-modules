import { EventEmitter } from 'events';

class StubHeaders implements Headers {
    public static make(data: Record<string, string>): StubHeaders {
        return new StubHeaders(data);
    }

    private data: Record<string, string>;

    private constructor(data: Record<string, string>) {
        this.data = {};

        for (const [name, value] of Object.entries(data)) {
            this.set(name, value);
        }
    }
    // TODO: to make ts compiler happy
    public getSetCookie(): string[] {
        throw new Error("Method not implemented.");
    }

    public [Symbol.iterator](): IterableIterator<[string, string]> {
        throw new Error("Method not implemented.");
    }

    public entries(): IterableIterator<[string, string]> {
        throw new Error("Method not implemented.");
    }

    public keys(): IterableIterator<string> {
        throw new Error("Method not implemented.");
    }

    public values(): IterableIterator<string> {
        throw new Error("Method not implemented.");
    }

    public append(name: string, value: string): void {
        this.data[this.normalizeHeader(name)] = value;
    }

    public delete(name: string): void {
        delete this.data[this.normalizeHeader(name)];
    }

    public get(name: string): string | null {
        return this.data[this.normalizeHeader(name)] ?? null;
    }

    public has(name: string): boolean {
        return this.normalizeHeader(name) in this.data;
    }

    public set(name: string, value: string): void {
        this.data[this.normalizeHeader(name)] = value;
    }

    public forEach(
        callbackfn: (value: string, name: string, parent: Headers) => void
    ): void {
        for (const [name, value] of Object.entries(this.data)) {
            callbackfn(value, name, this);
        }
    }

    private normalizeHeader(name: string): string {
        return name.toLowerCase();
    }
}


class StubResponse implements Response {

    public static make(
        content: string = '',
        headers: Record<string, string> = {},
        status: number = 200,
    ): StubResponse {
        return new StubResponse(status, content, headers);
    }

    public static notFound(): StubResponse {
        return new StubResponse(404);
    }

    private content: string;

    public readonly body!: ReadableStream<Uint8Array> | null;
    public readonly bodyUsed!: boolean;
    public readonly headers: StubHeaders;
    public readonly ok!: boolean;
    public readonly redirected!: boolean;
    public readonly status: number;
    public readonly statusText!: string;
    public readonly trailer!: Promise<Headers>;
    public readonly type!: ResponseType;
    public readonly url!: string;

    private constructor(status: number, content: string = '', headers: Record<string, string> = {}) {
        this.status = status;
        this.content = content;
        this.headers = StubHeaders.make(headers);
    }

    public async arrayBuffer(): Promise<ArrayBuffer> {
        throw new Error('StubResponse.arrayBuffer is not implemented');
    }

    public async blob(): Promise<Blob> {
        throw new Error('StubResponse.blob is not implemented');
    }

    public async formData(): Promise<FormData> {
        throw new Error('StubResponse.formData is not implemented');
    }

    public async json(): Promise<unknown> {
        return JSON.parse(this.content);
    }

    public async text(): Promise<string> {
        return this.content;
    }

    public clone(): Response {
        return { ...this };
    }

}

class StubFetcher extends EventEmitter {

    public fetchSpy!: jest.SpyInstance<Promise<Response>, [RequestInfo, RequestInit?]>;

    private fetchResponses: Response[] = [];

    public reset(): void {
        this.fetchResponses = [];

        this.fetchSpy.mockClear();
    }

    public addFetchNotFoundResponse(): void {
        this.fetchResponses.push(StubResponse.notFound());
    }

    public addFetchResponse(content: string = '', headers: Record<string, string> = {}, status: number = 200): void {
        this.fetchResponses.push(StubResponse.make(content, headers, status));
    }

    public async fetch(_: RequestInfo, __?: RequestInit): Promise<Response> {
        const response = this.fetchResponses.shift();

        if (!response) {
            return new Promise((_, reject) => reject());
        }

        return response;
    }

}

const stubFetcher = new StubFetcher();

// stubFetcher.fetchSpy = jest.spyOn(stubFetcher, 'fetch');

export default stubFetcher;
