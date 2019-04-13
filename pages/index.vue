<template>
  <section class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Bravo</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
          <a class="nav-link">
            {{workspace.team_domain_name}}
          </a>
          </li>
        </ul>

        <form class="form-inline my-2 my-lg-0">
          <input class="form-control mr-sm-2 flex-grow-1" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>
    <div class="container d-flex mt-4 mt-md-2">
      <div class="col-2 h-100"></div>
      <div class="d-flex flex-wrap col-8">
        <div class="mb-3 col-12" v-for="bravo of bravos" v-bind:key="bravo._id">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="media">
                <img style="background-color:blue;width:64px;height:64px;border-radius: 64px" src="/img/placeholder-man.png" class="m-2" alt="#">
                <div class="media-body">
                  <div class="text-left mb-2"><span class="bravo-receiver">{{ bravo.to.join(', ') }}</span> <span class="bravo-light-weight-text">receive bravo for</span></div>
                  <div class="text-left mb-2"><span class="bravo-reason">{{ bravo.reason }}</span></div>
                  <div class="text-left mb-2"><div class=" bravo-medal mr-1 d-inline-block"></div><span class="bravo-light-weight-text">100 points</span></div>
                  <div class="text-left mb-2"><span class="bravo-light-weight-text">from</span> <nuxt-link :to="`/user/${bravo.from}`" class="bravo-from-user">{{ bravo.from }}</nuxt-link></div>
                  <div class="text-left"><span class="bravo-light-weight-text">3 hours ago</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-2 align-self-stretch" />
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      workspace: {
        team_domain: "zaigezaigu",
        team_domain_name: "载歌在谷",
      },
      bravos : [
        {"_id":"5cb15cbf5d96468e04e8d663","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
        {"_id":"5cb15cbf5d96468e04e8d664","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
        {"_id":"5cb15cbf5d96468e04e8d665","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
        {"_id":"5cb15cbf5d96468e04e8d666","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
        {"_id":"5cb15cbf5d96468e04e8d667","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
        {"_id":"5cb15cbf5d96468e04e8d668","timestamp":"2019-04-13T03:51:27.519Z","from":"xinbenlv","from_id_type":"slack_user_name","to":["peipei.wang","kis87988"],"to_id_type":"slack_user_name","reason":"developing #proj-bravo-unnamed","raw":{"token":"hpAvDVwBoIdgScuBgx19eLWh","team_id":"T07DT2QMB","team_domain":"haoshiyou","channel_id":"CHHQ536MR","channel_name":"noisy-dev","user_id":"U07DSL5T4","user_name":"xinbenlv","command":"/thank","text":"@peipei.wang and @kis87988 for developing #proj-bravo-unnamed","response_url":"https://hooks.slack.com/commands/T07DT2QMB/611191241750/bAY0qwLTdn7kbh5CtJ6sN74K","trigger_id":"607243872469.7469092725.77afec3da383b4a23e9fdba001f91229"},"raw_data_type":"slack_slash_command"},
      ]
    }
  },
  async mounted() {
    this.bravos = await this.fetch(this.workspace.team_domain, 0);
  },
  methods: {
    fetch: async function(team_domain, since_ts_utc_ms) {
        return await this.$axios.$get(`/api/bravos/list?team_domain=${team_domain}&since_ts=${since_ts_utc_ms}`);
      }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.bravo-light-weight-text {
  color: #686868;
  font-size: 20px;
  line-height: 27px;
}
.bravo-receiver {
  font-size: 24px;
  line-height: 33px;
  font-weight: 900;
}
.bravo-from-user {
  color: #4A90E2;
  font-size: 24px;
  line-height: 27px;
}
.bravo-reason {
  color: #1D1D1D;
  font-size: 24px;
  line-height: 33px;
}
.bravo-medal {
  width:20px;
  height:20px;
  border: 2.5px solid;
  background-color:#F9B82E;
  border-color:gold;
  border-radius: 20px;
  line-height: 27px;
}
</style>
