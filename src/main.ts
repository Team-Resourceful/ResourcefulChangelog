import * as core from '@actions/core';
import * as github from '@actions/github'
import * as fs from 'fs';

async function run(): Promise<void> {
    try {
        const lastReleaseName = core.getInput('last_release_name');
        const changelogFile = core.getInput('changelog_file');
        const token = core.getInput('github_token');

        const octokit = github.getOctokit(token);

        const repo = github.context.repo;
        const releaseResponse = await octokit.rest.repos.getLatestRelease({
            owner: repo.owner,
            repo: repo.repo
        });
        const lastReleaseTag = releaseResponse.data.tag_name;

        const commitsResponse = await octokit.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
            sha: lastReleaseTag
        });
        const commitMessages = commitsResponse.data.map((commit) => commit.commit.message);

        const logRegex = /<log>(.*?)<\/log>/gs;
        const changelogText = commitMessages
            .map((message) => {
                const match = logRegex.exec(message);
                if (match) {
                    return match[1];
                }
                return '';
            })
            .join('\n\n');

        const changelog = fs.readFileSync(changelogFile, 'utf8');
        const newChangelog = `## ${lastReleaseName}\n\n${changelogText}\n\n${changelog}`;
        fs.writeFileSync(changelogFile, newChangelog);

        core.setOutput('changelog', newChangelog);
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()