# Architecture rules

- Keep public pages and authenticated workspaces separate; public inventory reads only approved published records.
- Use the generated Cloud client and typed database schema; authorization belongs in database policies and controlled functions, not browser storage.
- Create businesses through an authenticated database function that grants ownership only for the newly created tenant; platform roles require operator bootstrap.
- Centralize official identity and canonical origin in company configuration so all public metadata shares one source.
- Preserve source demonstration listings as explicitly labelled examples separate from live inventory.