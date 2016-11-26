class DatagramFinder

  def self.all
    Datagram.where('archived IS DISTINCT FROM true').all.map{|d|
      (d.param_sets || {}).select{|n,v|
        (v["frequency"].to_i > 0 || !p["at"].blank?) rescue nil
      }.map{|k,m| OpenStruct.new(m.merge("id" => d.id))}
    }.select{|k| !k.blank?}.flatten
  end

end
