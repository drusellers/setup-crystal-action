import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import * as octkit from "@actions/github";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as semver from "semver";
import { Option } from "./main";
import { Response, ReposGetReleaseByTagResponse, ReposGetLatestReleaseResponse } from "@octokit/rest";

const platform: string = os.platform();

async function getInstallAsset(option: Option): Promise<ReposGetReleaseByTagResponse | ReposGetLatestReleaseResponse> {
    const github = new octkit.GitHub(option.githubToken);
    let response: Response<ReposGetReleaseByTagResponse | ReposGetLatestReleaseResponse>;
    if (option.shardsVersion != "latest") {
        response = await github.repos.getReleaseByTag({
            owner: "crystal-lang",
            repo: "shards",
            tag: `v${option.shardsVersion}`
        });
    } else {
        response = await github.repos.getLatestRelease({
            owner: "crystal-lang",
            repo: "shards"
        });
    }

    if (400 <= response.status) {
        throw Error("fail get crystal releases");
    }

    return response.data;
}

async function installNeedSoftware() {
    if (platform == "linux") {
        await exec.exec("sudo apt-get install libyaml-dev", undefined);
    }
    if (platform == "darwin") {
        await exec.exec("brew install libyaml", undefined);
    }
}

export async function installShards(option: Option) {
    if (platform == "win32") {
        throw Error("setup crystal action not support windows");
    }
    if (option.shardsVersion == null && platform == "linux") {
        return;
    }

    const installAsset = await getInstallAsset(option);

    await installNeedSoftware();

    let toolPath = tc.find("shards", installAsset.tag_name);
    if (!toolPath) {
        const downloadPath = await tc.downloadTool(installAsset.tarball_url);
        const extractPath = await tc.extractTar(downloadPath);
        const nestedFolder = fs.readdirSync(extractPath).filter(x => x.startsWith("crystal"))[0];
        const sourcePath = path.join(extractPath, nestedFolder);

        core.info(
            `dump option shards: ${option.shardsVersion}, 0.10.0 <= shards == ${semver.lte(
                "0.10.0",
                option.shardsVersion
            )}`
        );
        if (option.shardsVersion == "latest" || semver.lte("0.10.0", option.shardsVersion)) {
            // shards changes to require crystal-molinillo on 0.10.0
            await exec.exec("make lib", undefined, {
                cwd: sourcePath
            });
            await exec.exec("make", undefined, {
                cwd: sourcePath
            });
        } else {
            await exec.exec("make CRFLAGS=--release", undefined, {
                cwd: sourcePath
            });
        }
        toolPath = await tc.cacheDir(sourcePath, "shards", installAsset.tag_name);
    }

    const binPath = path.join(toolPath, "bin");
    core.addPath(binPath);

    core.setOutput("installed_shards_json", JSON.stringify(installAsset));
}
