import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'

async function run(): Promise<void> {
    try {
        const releaseVersion = core.getInput('release_version')
        const changelogFile = core.getInput('changelog_file') || 'changelog.md'
        const token = core.getInput('github_token')
        const octokit = github.getOctokit(token)
        const repo = github.context.repo
        const releaseResponse = await octokit.rest.repos.getLatestRelease(repo)

        const commitsResponse = await octokit.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
            since: releaseResponse.data.created_at
        })
        const commits = commitsResponse.data.map(
            commit => commit.commit.message
        )

        const logRegex = /<log>(.*?)<\/log>/gs;
        const changelogText = commits
            .reduce<string[]>((acc, message) => {
                logRegex.lastIndex = 0;
                const match = logRegex.exec(message);
                if (match && match[1]) {
                    acc.push(match[1].trim());
                }

                return acc;
            }, [])
            .join('\n');

        const changelog = fs.readFileSync(changelogFile, 'utf8');
        const newChangelog = `# -----{ ${releaseVersion} }-----\n\n${changelogText}\n\n${changelog}`;
        fs.writeFileSync(changelogFile, newChangelog);
        core.setOutput('changelog', newChangelog);
        console.log("New Changelog Generated:");
        console.log(newChangelog);
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

run()
