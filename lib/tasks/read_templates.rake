task :read_templates => :environment do
  Dir.glob('./templates/*jq').each do |f|
    id, name = f.match(/(\d+)-(.*)/)[1..2]
    d = Datagram.find(id); d.views ||= {}
    d.views[name] = {template: File.read(f), type: name.split(".")[-1]}
    d.save
  end
end
