# setup-crystal-action
![](https://github.com/MeilCli/setup-crystal-action/workflows/CI/badge.svg)  
JavaScript based setup Crystal action for GitHub Actions.  

## Required
`setup-crystal-action` must execute on Linux or macOS, because I do not know usage that WSL on GitHub Actions.

## Example
```yaml
name: CI

on: 
  push:
    branches:    
    - master
  pull_request:
    branches:
    - master

jobs:
  example:
    runs-on: ubuntu-16.04
    steps:
      - uses: MeilCli/setup-crystal-action@v3
        with: 
          crystal_version: 0.34.0
          shards_version: 0.10.0
      - name: Run Crystal
        run: |
          echo 'puts "Hello Crystal"' > hello.cr
          crystal run hello.cr
```

You can also pin to a [specific release](https://github.com/MeilCli/setup-crystal-action/releases) version in the format `@v3.x.x`

## input
- `crystal_version`
  - required
  - install crystal version
  - value: `latest` or version value, see [crystal-lang/crystal](https://github.com/crystal-lang/crystal/releases)
  - default: `latest`
- `shards_version`
  - required
  - install shards version
  - value: `latest` or `skip` or version value, see [crystal-lang/shards](https://github.com/crystal-lang/shards/releases)
    - if set `skip`, not install shards
  - default: `latest`
- `github_token`
  - github token, using get GitHub Release of crystal-lang/crystal or crystal-lang/shards
  - default: `GITHUB_TOKEN`

## output
- `installed_crystal_json`
  - installed json that GitHub Release Asset
- `installed_shards_json`
  - installed json that GitHub Release

## License
[MIT License](LICENSE)
