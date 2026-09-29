import type { AxiosRequestConfig } from 'axios';
import {
    Bundle,
    FhirResource,
    Parameters,
    Questionnaire,
    QuestionnaireItem,
    QuestionnaireResponseItem,
} from 'fhir/r4b';

import { initServicesFromService, uuid4 } from '@beda.software/fhir-react';
import { failure, RemoteDataResult, success } from '@beda.software/remote-data';

// Mirrors a server-side $populate without expressions: every group gets one (empty) instance so that
// repeatable groups start with a single row, and questions are left unanswered.
function populateGroupSkeleton(items: QuestionnaireItem[] = []): QuestionnaireResponseItem[] {
    return items
        .filter((item) => item.type === 'group')
        .map((item) => ({ linkId: item.linkId, text: item.text, item: populateGroupSkeleton(item.item) }));
}

/**
 * In-memory replacement for the FHIR server used by tests.
 *
 * Supports what the controls exercise: CRUD on resources, search by type (optionally filtered by `_id`/`id`),
 * and the SDC operations called by `QuestionnaireResponseForm` ($populate, $constraint-check, $extract).
 */
export function createInMemoryFHIRService(initialResources: FhirResource[] = []) {
    const resources: FhirResource[] = [...initialResources];

    const service = async <S = any, F = any>(config: AxiosRequestConfig): Promise<RemoteDataResult<S, F>> => {
        const method = (config.method ?? 'GET').toUpperCase();
        const [resourceType, idOrOperation] = (config.url ?? '').split('/').filter(Boolean);
        const ok = (data: unknown) => success(data as S);

        if (method === 'POST' && resourceType === 'Questionnaire' && idOrOperation === '$populate') {
            const params = config.data as Parameters;
            const questionnaire = params.parameter?.find((p) => p.name === 'questionnaire')?.resource as Questionnaire;

            return ok({
                resourceType: 'QuestionnaireResponse',
                status: 'in-progress',
                item: populateGroupSkeleton(questionnaire?.item),
            });
        }
        if (method === 'POST' && resourceType === 'QuestionnaireResponse' && idOrOperation === '$constraint-check') {
            return ok({ resourceType: 'Parameters' });
        }
        if (method === 'POST' && resourceType === 'Questionnaire' && idOrOperation === '$extract') {
            return ok({ resourceType: 'Bundle', type: 'transaction-response', entry: [] });
        }

        if ((method === 'POST' && !idOrOperation) || (method === 'PUT' && idOrOperation)) {
            const resource = { ...config.data, id: idOrOperation ?? config.data.id ?? uuid4() } as FhirResource;
            const index = resources.findIndex((r) => r.resourceType === resourceType && r.id === resource.id);
            if (index === -1) {
                resources.push(resource);
            } else {
                resources[index] = resource;
            }

            return ok(resource);
        }

        if (method === 'GET' && resourceType) {
            if (idOrOperation) {
                const resource = resources.find((r) => r.resourceType === resourceType && r.id === idOrOperation);

                return resource ? ok(resource) : (failure({ resourceType: 'OperationOutcome' } as F) as any);
            }

            const id = config.params?._id ?? config.params?.id;
            const matched = resources.filter((r) => r.resourceType === resourceType && (!id || r.id === id));
            const bundle: Bundle = {
                resourceType: 'Bundle',
                type: 'searchset',
                total: matched.length,
                entry: matched.map((resource) => ({ resource })),
            };

            return ok(bundle);
        }

        return failure({ message: `In-memory FHIR service: unsupported ${method} ${config.url}` } as F);
    };

    return { service, resources };
}

/**
 * Factory for `vi.mock('src/services/fhir', ...)`: keeps the real module but routes the FHIR service helpers
 * (`service`, `getFHIRResources`, ...) to an in-memory store seeded with `resources`.
 */
export async function mockFHIRServicesModule(resources: FhirResource[]) {
    const actual = await vi.importActual<typeof import('src/services/fhir')>('src/services/fhir');
    const { service } = createInMemoryFHIRService(resources);

    return { ...actual, ...initServicesFromService(service), service };
}
