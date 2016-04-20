<?php

namespace NTR1X\SearchBundle\Search;

class Engine {

	public function __construct($url, $collection) {

		$this->url = $url;
		$this->collection = $collection;
	}

	public function update(Array $document) {

		global $_CONFIG;

		$string = json_encode(array(
			'add' => array(
				'doc' => $document,
				'boost' => 1,
				'overwrite' => true,
				'commitWithin' => 1000
			)
		));

		$ch = curl_init("{$this->url}/{$this->collection}/update?wt=json");

		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $string);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($string))
		);

		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

		//execute post
		$result = json_decode(curl_exec($ch));

		//close connection
		curl_close($ch);
	}

	public function removeAll($query) {

		global $_CONFIG;

		$string = json_encode(array(
			'delete' => array(
				'query' => $query,
				'commitWithin' => 1000
			),
		));

		$ch = curl_init("{$this->url}/{$this->collection}/update?wt=json");

		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $string);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($string))
		);

		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

		//execute post
		$result = json_decode(curl_exec($ch));

		//close connection
		curl_close($ch);

		// trace($result);
	}

	public function remove($id) {

		global $_CONFIG;

		$string = json_encode(array(
			'delete' => array(
				'query' => "id:{$id}",
				'commitWithin' => 1000
			),
		));

		$ch = curl_init("{$this->url}/{$this->collection}/update?wt=json");

		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $string);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($string))
		);

		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

		//execute post
		$result = json_decode(curl_exec($ch));

		//close connection
		curl_close($ch);
	}

	public function load(&$array, $query, $filters = [], $offset = 0, $limit = 10, \Closure $visitor) {

		global $_CONFIG;

		$limit = (int) $limit;
		$offset = (int) $offset;
		// $query = urlencode(empty($query) ? '*' : $query);
		$query = urlencode(empty($query) ? '*' : $query);

		$fs = [];
		foreach ($filters as $key=>$value) {
			$fs[] = implode(':', array($key, $value));
		}

		$filter = count($fs) == 0
			? null
			: urlencode(implode(' AND ', $fs))
		;

		$rand = rand();
		$ch = curl_init("{$this->url}/{$this->collection}/select?wt=json&df=all&start={$offset}&rows={$limit}&_={$rand}&q={$query}&fq={$filter}");

		curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_VERBOSE, 1);

		$ce = curl_exec($ch);

		//execute post
		$result = json_decode($ce);

		//close connection
		curl_close($ch);

		if (isset($result->response)) {
			foreach ($result->response->docs as $key=>$value) {

				if ($visitor != null) {
					$visitor($value);
				}
				$array[] = get_object_vars($value);
			}
			return $result->response->numFound;
		}

		return 0;
	}
}