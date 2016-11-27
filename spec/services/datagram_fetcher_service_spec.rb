require 'rails_helper'

describe DatagramFetcherService do

  let!(:watch) {

    FactoryGirl.create(:watch, url: "sqlite://./spec/fixtures/chinook.db",
                               data: { query: "select a.name, count(*) from  albums b join artists a on b.ArtistId = a.ArtistId group by a.name order by count(*) desc limit 10;"})
  }
  let!(:datagram) { Datagram.create(watch_ids: [watch.id], name: "Album Count", user_id: watch.user_id) }

  describe "empty params" do
    let(:dfs) {DatagramFetcherService.new(datagram, {})}
    let(:params) { dfs.params }
    it { expect(params).to be_a(DatagramFetcherService::Params) }
    it("query_params should be empty") { expect(params.q_params.to_h).to be_empty }
    it("search params should be empty") { expect(params.search_params.to_h).to be_empty }
    it("format should be json") { expect(params.format).to eq(:json)}
  end
  describe "with publish_params" do
    describe "and no param set" do
      let!(:datagram) { FactoryGirl.create(:datagram, publish_params: {foo: "bar"})}
      it("should use default params") {
        expect(DatagramFetcherService.new(datagram, nil).params.q_params.stringify_keys).to eq(datagram.publish_params)
        expect(DatagramFetcherService.new(datagram, {}).params.q_params.stringify_keys).to eq(datagram.publish_params)
        expect(DatagramFetcherService.new(datagram, {controller: "bar"}).params.q_params.stringify_keys).to eq(datagram.publish_params)
        expect(DatagramFetcherService.new(datagram, {controller: "bar", params: nil}).params.q_params.stringify_keys).to eq(datagram.publish_params)
      }
    end
    describe "with param_sets" do
      let(:ps) { {"bix" => {name: "bix", params: {"qux" => "fix"}}}}
      let!(:datagram) { FactoryGirl.create(:datagram, publish_params: {foo: "bar"}, param_sets: ps)}
      it("should use param_set params when given a name") {
        expect(DatagramFetcherService.new(datagram, {controller: "bar", params: "bix"}).params.q_params.stringify_keys).to eq(ps["bix"][:params])
      }
      it("should use provided params if provided") {
        expect(DatagramFetcherService.new(datagram, {controller: "bar", params: {a: 1}}).params.q_params.stringify_keys).to eq({"a" => 1})
      }
    end

  end


  describe DatagramFetcherService::Params do
    describe "with params" do
      let(:ps) {
        { q_params: {a: 1}, controller: 'foo', refresh: 100}
      }
      let(:params) { DatagramFetcherService::Params.new(ps) }
      it("should have correct query_params") { expect(params.query_params).to eq({a: 1})}
      it("should have correct search_params") { expect(params.search_params).to eq({refresh: 100})}
      describe "sync" do
        let(:nsps) { ps.merge(sync: "false") }
        let(:no_sync_params) { DatagramFetcherService::Params.new(nsps) }
        it("should sync by default") { expect(params).to be_sync }
        it("should be async when specified") { expect(no_sync_params).to_not be_sync }
      end
    end
  end


end
