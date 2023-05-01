# ResourcefulChangelog
<hr>
A GitHub action for generating and appending a changelog based on commit messages. 
Any text between the tags `&lt;log&gt;&lt;/log&gt;` is written to the changelog file. 
The changelog file is then prepended with the version number as `# -----{ 1.0.0 }-----`.

## Example

```yaml
- name: Update Changelog
  uses: Team-Resourceful/ResourcefulChangelog@0.0.1
  with:
    release_version: "1.0.0"
    changelog_file: "changelog.md"
    github_token: ${{ secrets.GH_TOKEN }}
```
