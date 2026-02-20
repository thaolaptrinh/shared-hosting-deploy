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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
async function run() {
    try {
        const host = core.getInput('host', { required: true });
        const user = core.getInput('user', { required: true });
        const sshKey = core.getInput('ssh_key', { required: true });
        const repoPath = core.getInput('repo_path', { required: true });
        const branch = core.getInput('branch') || 'main';
        const postDeploy = core.getInput('post_deploy');
        core.setSecret(sshKey);
        const sshKeyPath = path.join(os.tmpdir(), `deploy_key_${Date.now()}`);
        fs.writeFileSync(sshKeyPath, sshKey, { mode: 0o600 });
        core.info('SSH key written to temporary file with 600 permissions');
        const sshArgs = [
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'UserKnownHostsFile=/dev/null',
            '-i', sshKeyPath,
            `${user}@${host}`
        ];
        core.info(`Connecting to ${host} as ${user}...`);
        await exec.exec('ssh', [...sshArgs, 'test', '-d', repoPath], {
            failOnStdErr: false
        });
        core.info(`Repository path exists: ${repoPath}`);
        const isGitRepo = await exec.exec('ssh', [...sshArgs, 'cd', repoPath, '&&', 'git', 'rev-parse', '--git-dir'], {
            failOnStdErr: false,
            ignoreReturnCode: true
        });
        if (isGitRepo !== 0) {
            core.error(`Directory ${repoPath} is not a git repository`);
            core.error('Please ensure the repository is initialized with git');
            throw new Error(`Path ${repoPath} is not a git repository`);
        }
        core.info(`Verified ${repoPath} is a git repository`);
        core.info(`Fetching all branches and pruning old refs...`);
        await exec.exec('ssh', [...sshArgs, 'cd', repoPath, '&&', 'git', 'fetch', '--all', '--prune']);
        core.info(`Resetting to origin/${branch}...`);
        const resetResult = await exec.exec('ssh', [...sshArgs, 'cd', repoPath, '&&', 'git', 'reset', '--hard', `origin/${branch}`], {
            ignoreReturnCode: true
        });
        if (resetResult !== 0) {
            core.error(`Failed to reset to origin/${branch}. Does the branch exist on the remote?`);
            throw new Error(`git reset --hard origin/${branch} failed`);
        }
        core.info(`Successfully deployed ${branch} to ${repoPath}`);
        if (postDeploy && postDeploy.trim().length > 0) {
            core.info('Running post-deploy commands...');
            await exec.exec('ssh', [...sshArgs, 'cd', repoPath, '&&', postDeploy]);
            core.info('Post-deploy commands completed');
        }
        else {
            core.info('No post-deploy commands provided, skipping');
        }
        fs.unlinkSync(sshKeyPath);
        core.info('SSH key cleaned up');
        core.info('Deployment completed successfully!');
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('Unknown error occurred during deployment');
        }
    }
}
run();
