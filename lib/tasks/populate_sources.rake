task :populate_sources => :environment do

  Watch.all.each do |d|
    s = Source.where(url: d.url).first_or_create(name: d.url, url: d.url, user_id: d.user_id)
    d.source_id = s.id
    d.save
  end
end
