import {
  codingLabEditorUrl,
  labVerification,
} from '../../../../../src/app/features/workshop-publishing/utils/publishing-verification';
import { publishingProgress } from '../../../../../src/app/features/workshop-publishing/utils/publishing-step-display';
import type { PublishingReceipt } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

type Step = PublishingReceipt['steps'][number];
const labId = '6aebffc0140f132cb6017a19';
const failed: Step = {
  name: 'verify_lab_0',
  status: 'complete',
  result: { passed: false, totalTests: 6, passedTests: 0 },
};

describe('Publishing verification outcomes and lab destinations', () => {
  it('distinguishes completed operations from a failed verification result', () => {
    expect(labVerification(failed)).toEqual({
      passed: false,
      totalTests: 6,
      passedTests: 0,
    });
    expect(publishingProgress([failed])).toContain(
      '1 of 1 publishing steps complete'
    );
    expect(publishingProgress([failed])).toContain(
      '1 coding lab failed verification'
    );
    const passed: Step = {
      ...failed,
      result: { passed: true, totalTests: 6, passedTests: 6 },
    };
    expect(labVerification(passed)?.passed).toBeTrue();
    expect(publishingProgress([passed])).not.toContain('failed');
  });
  it('only interprets explicit completed verify results and keeps malformed counts unknown', () => {
    expect(
      labVerification({ ...failed, status: 'pending' })
    ).toBeNull();
    expect(
      labVerification({ ...failed, name: 'create_lab_0' })
    ).toBeNull();
    for (const result of [null, [], false, { passed: 'false' }, {}]) {
      expect(labVerification({ ...failed, result })).toBeNull();
    }
    for (const result of [
      { passed: false },
      { passed: false, passedTests: -1, totalTests: 6 },
      { passed: false, passedTests: 7, totalTests: 6 },
      { passed: false, passedTests: 1.5, totalTests: 6 },
    ]) {
      expect(labVerification({ ...failed, result })).toEqual({
        passed: false,
        passedTests: null,
        totalTests: null,
      });
    }
  });
  it('uses the matching lab creation identity for create, version and verification steps', () => {
    const steps: Step[] = [
      {
        name: 'create_lab_1',
        status: 'complete',
        result: { _id: '111111111111111111111111' },
      },
      {
        name: 'create_lab_0',
        status: 'complete',
        result: { _id: labId },
      },
      {
        name: 'create_version_0',
        status: 'complete',
        result: { _id: '222222222222222222222222' },
      },
      failed,
    ];
    for (const step of steps.slice(1))
      expect(codingLabEditorUrl(step, steps)).toBe(
        '/coding-labs-editor/coding-labs/' + labId
      );
    expect(codingLabEditorUrl(steps[0], steps)).toContain(
      '111111111111111111111111'
    );
  });
  it('suppresses pending lab-step destinations even when lab creation completed', () => {
    const created: Step = {
      name: 'create_lab_0',
      status: 'complete',
      result: { _id: labId },
    };
    for (const name of [
      'create_lab_0',
      'create_version_0',
      'verify_lab_0',
    ]) {
      expect(
        codingLabEditorUrl({ name, status: 'pending' }, [created])
      ).toBeNull();
    }
    expect(
      codingLabEditorUrl({ ...failed, status: 'complete' }, [created])
    ).not.toBeNull();
  });
  it('never guesses an editor link from missing, pending, malformed or unrelated results', () => {
    expect(codingLabEditorUrl(failed, [failed])).toBeNull();
    expect(
      codingLabEditorUrl({ ...failed, name: 'create_workshop' }, [])
    ).toBeNull();
    for (const id of [
      '../elsewhere',
      'javascript:alert(1)',
      '',
      null,
      12,
      'https://example.com',
    ]) {
      expect(
        codingLabEditorUrl(failed, [
          {
            name: 'create_lab_0',
            status: 'complete',
            result: { _id: id },
          },
        ])
      ).toBeNull();
    }
    expect(
      codingLabEditorUrl(failed, [
        {
          name: 'create_lab_0',
          status: 'pending',
          result: { _id: labId },
        },
      ])
    ).toBeNull();
  });
});
