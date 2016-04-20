<?php

namespace NTR1X\SearchBundle\Entity;

use NTR1X\SearchBundle\Search\Engine;

use Symfony\Component\Validator\Constraints as Assert;

use Doctrine\ORM\Mapping as ORM;


/**
 * Search
 * 
 * @ORM\Table(name="search_items")
 * @ORM\Entity(repositoryClass="NTR1X\SearchBundle\Repository\SearchRepository")
 * @ORM\HasLifecycleCallbacks
 */
class Search
{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	public $id;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="type", type="string", length=511)
	 */
	private $type;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="url", type="string", length=511)
	 */
	private $url;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="collection", type="string", length=511)
	 */
	private $collection;

	private $data;

	/**
	 * @ORM\PostPersist()
	 * @ORM\PostUpdate()
	 */
	public function updateIndex() {

		$engine = new Engine(
			$this->getUrl(),
			$this->getCollection()
		);

		$data = $this->getData();

		$engine->update(array(
			"id" => $this->getId(),
			"type" => $this->getType(),
			"url" => $data['url'],
			"date" => $data['date'],
			"tags" => $data['tags'],
			"title" => strip_tags($data["title"]),
			"promo" => strip_tags($data["promo"]),
			"content" => strip_tags($data["content"]),
		));
	}

	/**
	 * @ORM\PreRemove()
	 */
	public function removeIndex() {

		$engine = new Engine(
			$this->getUrl(),
			$this->getCollection()
		);

		$engine->remove($this->getId());
	}

	/**
	 * Get id
	 *
	 * @return integer
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Set type
	 *
	 * @param string $type
	 *
	 * @return Search
	 */
	public function setType($type)
	{
		$this->type = $type;

		return $this;
	}

	/**
	 * Get type
	 *
	 * @return string
	 */
	public function getType()
	{
		return $this->type;
	}

	/**
	 * Set url
	 *
	 * @param string $url
	 *
	 * @return Search
	 */
	public function setUrl($url)
	{
		$this->url = $url;

		return $this;
	}

	/**
	 * Get url
	 *
	 * @return string
	 */
	public function getUrl()
	{
		return $this->url;
	}

	/**
	 * Set collection
	 *
	 * @param string $collection
	 *
	 * @return Search
	 */
	public function setCollection($collection)
	{
		$this->collection = $collection;

		return $this;
	}

	/**
	 * Get collection
	 *
	 * @return string
	 */
	public function getCollection()
	{
		return $this->collection;
	}

	/**
	 * Sets file.
	 *
	 * @param array $data
	 */
	public function setData(array $data) {

		$this->data = $data;

		return $this;
	}

	/**
	 * Get data
	 *
	 * @return array
	 */
	public function getData()
	{
		return $this->data;
	}
}
