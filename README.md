# odoo-cli

odoo-cli used to fetch and addons from github and gitlab and enable developer to upgrade and install modules
## YMl File Sample Configuration 
```
odoo: 
  default:
     addonsPath: /home/odoo/extra-addons
     gitlabUrl: https://git.odooerp.com
  dependencies:
    - source: gitlab
      owner: odoo
      repo: generic-hr15-e
      version: 642a0c6c62b6de3b1ed2285c9d87c46072bee1e6
      addons: 
        - addons/odoo_attendance_portal
        - addons/zk_attendance_integration
    - source: github
      owner: OCA
      repo: contract
      version: 59679fc14baedf21c9c17fd0d578a5778c24b347
      addons: 
        - agreement
    - source: gitlab
      owner: odoo
      repo: sana
      version: 32b8b5c8e542a26b072b8f81239bddc0c028a1b6
      addons: 
        - addons/odoo_hr_absence
```