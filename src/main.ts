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
        //const lastReleaseTag = releaseResponse.data.tag_name;

        const commitsResponse = await octokit.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
            since: releaseResponse.data.created_at
        });
        const commitMessages = commitsResponse.data.map((commit) => commit.commit.message);

        const logRegex = /<log>(.*?)<\/log>/gs;
        const changelogText = commitMessages
            .reduce<string[]>((acc, message) => {
                console.log(`message: ${message}`)
                const match = message.match(logRegex);
                console.log(`match: ${match}`);
                if (match) {
                    console.log(`match[1]: ${match[1]}`)
                    console.log(`groups: ${match.groups?[1]:String}`)
                }
                if (match && match[1]) {
                    acc.push(match[1]);
                }
                console.log(`acc: ${acc}`)
                return acc;
            }, [])
            .join('');

        const changelog = fs.readFileSync(changelogFile, 'utf8');
        const newChangelog = `## ${lastReleaseName}\n\n${changelogText}\n\n${changelog}`;
        console.log(`Last release:  ${lastReleaseName}`);
        console.log(`Changelog text: ${changelogText}`);
        console.log(`changelog: ${changelog}`);
        console.log(`new changelog: ${newChangelog}`);
        fs.writeFileSync(changelogFile, newChangelog);

        core.setOutput('changelog', newChangelog);
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()