#!/bin/bash
# This script fetches api-platform/docs
root=$(pwd)

IFS=$'\n' read -d '' -r -a versions < docs-versions.txt

rm -rf docs.temp
git clone --depth=1 https://github.com/api-platform/docs docs.temp
cd docs.temp

for version in "${versions[@]}"
do
	git remote set-branches --add origin $version
done

git fetch --no-tags --depth=1 --multiple

for version in "${versions[@]}"
do
	if [[ -d $root/content/docs/$version ]]; then
		rm -r $root/content/$version
	fi

	git worktree add $root/content/$version origin/$version
done

find $root/content/ -name "index.md" -exec sh -c 'f="{}"; mv -- "$f" "${f%index.md}_index.md"' \;
