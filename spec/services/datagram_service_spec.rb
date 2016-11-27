require 'rails_helper'

describe DatagramFetcherService do

  let!(:watch) {
    FactoryGirl.create(:watch, url: "sqlite://./spec/fixtures/chinook.db",
                               data: { query: "select a.name, count(*) from  albums b join artists a on b.ArtistId = a.ArtistId group by a.name order by count(*) desc limit 10;"})
  }
  let!(:datagram) { Datagram.create(watch_ids: [watch.id], name: "Album Count", user_id: watch.user_id) }
  let(:ds) {DatagramService.new(datagram, {})}

  example "publish" do
    expect(ds.send(:datagram)).to eq(datagram)
  end
end
