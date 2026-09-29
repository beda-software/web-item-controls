import '@testing-library/jest-dom/extend-expect';

import { cleanup } from '@testing-library/react';

declare global {
    // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
    var AppleID: any;
}

global.AppleID = {
    auth: {
        init: vi.fn(),
    },
};

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
    writable: true,
});

vi.mock('react-router-dom', async () => {
    const mod = (await vi.importActual('react-router-dom')) as any;

    return {
        ...mod,
        useNavigate: () => vi.fn(),
        useLocation: vi.fn().mockReturnValue({
            pathname: '/testroute',
            search: '',
            hash: '',
            state: null,
        }),
        useParams: vi.fn().mockReturnValue({}),
    };
});
