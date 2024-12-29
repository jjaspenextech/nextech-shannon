export type Integration = 'JIRA' | 'GITHUB' | 'SLACK' | 'CONFLUENCE';

export const integrations: {[key in Integration]:string} = {
    JIRA: '',
    GITHUB: '',
    SLACK: '',
    CONFLUENCE: '',
}
