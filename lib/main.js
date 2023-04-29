"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const lastReleaseName = core.getInput('last_release_name');
            const changelogFile = core.getInput('changelog_file');
            const token = core.getInput('github_token');
            const octokit = github.getOctokit(token);
            const repo = github.context.repo;
            const releaseResponse = yield octokit.rest.repos.getLatestRelease({
                owner: repo.owner,
                repo: repo.repo
            });
            const lastReleaseTag = releaseResponse.data.tag_name;
            const commitsResponse = yield octokit.rest.repos.listCommits({
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
            console.log(`Last release:  ${lastReleaseName}`);
            console.log(`Changelog text: ${changelogText}`);
            console.log(`changelog: ${changelog}`);
            console.log(`new changelog: ${newChangelog}`);
            fs.writeFileSync(changelogFile, newChangelog);
            core.setOutput('changelog', newChangelog);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map