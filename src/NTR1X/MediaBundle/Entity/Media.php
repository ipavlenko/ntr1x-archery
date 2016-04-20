<?php

namespace NTR1X\MediaBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use NTR1X\UploadBundle\Entity\Upload;
use NTR1X\SearchBundle\Entity\Search;

/**
 * Media
 *
 * @ORM\Table(name="media_items")
 * @ORM\Entity(repositoryClass="NTR1X\MediaBundle\Repository\MediaRepository")
 */
class Media
{
	/**
	 * @var int
	 *
	 * @ORM\Column(name="id", type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\ManyToOne(targetEntity="Category", inversedBy="items")
	 * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
	 */
	private $category;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="title", type="string", length=511)
	 */
	private $title;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="promo", type="text")
	 */
	private $promo;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="description", type="text")
	 */
	private $description;

	/**
	 * @var \DateTime
	 *
	 * @ORM\Column(name="published", type="date")
	 */
	private $published;

	/**
	 * @ORM\OneToMany(targetEntity="Tag", mappedBy="item", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
	 */
	private $tags;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="video", type="string", length=511)
	 */
	private $video;

	/**
	 * @var \NTR1X\UploadBundle\Entity\Upload
	 * 
	 * @ORM\OneToOne(targetEntity="\NTR1X\UploadBundle\Entity\Upload", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
	 * @ORM\JoinColumn(name="thumbnail_id", referencedColumnName="id")
	 */
	private $thumbnail;

	/**
	 * @var \NTR1X\SearchBundle\Entity\Search
	 * 
	 * @ORM\OneToOne(targetEntity="\NTR1X\SearchBundle\Entity\Search", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
	 * @ORM\JoinColumn(name="search_id", referencedColumnName="id")
	 */
	private $search;

	public function __construct() {
		$this->tags = new ArrayCollection();
	}


	/**
	 * Get id
	 *
	 * @return int
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Set title
	 *
	 * @param string $title
	 *
	 * @return Item
	 */
	public function setTitle($title)
	{
		$this->title = $title;

		return $this;
	}

	/**
	 * Get title
	 *
	 * @return string
	 */
	public function getTitle()
	{
		return $this->title;
	}

	/**
	 * Set promo
	 *
	 * @param string $promo
	 *
	 * @return Item
	 */
	public function setPromo($promo)
	{
		$this->promo = $promo;

		return $this;
	}

	/**
	 * Get promo
	 *
	 * @return string
	 */
	public function getPromo()
	{
		return $this->promo;
	}

	/**
	 * Set description
	 *
	 * @param string $description
	 *
	 * @return Item
	 */
	public function setDescription($description)
	{
		$this->description = $description;

		return $this;
	}

	/**
	 * Get description
	 *
	 * @return string
	 */
	public function getDescription()
	{
		return $this->description;
	}

	/**
	 * Set published
	 *
	 * @param \DateTime $published
	 *
	 * @return Item
	 */
	public function setPublished($published)
	{
		$this->published = $published;

		return $this;
	}

	/**
	 * Get published
	 *
	 * @return \DateTime
	 */
	public function getPublished()
	{
		return $this->published;
	}

	/**
	 * Add tag
	 *
	 * @param \NTR1X\MediaBundle\Entity\Tag $tag
	 *
	 * @return Media
	 */
	public function addTag(\NTR1X\MediaBundle\Entity\Tag $tag)
	{
		$this->tags[] = $tag;

		return $this;
	}

	/**
	 * Remove tag
	 *
	 * @param \NTR1X\MediaBundle\Entity\Tag $tag
	 */
	public function removeTag(\NTR1X\MediaBundle\Entity\Tag $tag)
	{
		$this->tags->removeElement($tag);
	}

	/**
	 * Get tags
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getTags()
	{
		return $this->tags;
	}

	/**
	 * Set category
	 *
	 * @param \NTR1X\MediaBundle\Entity\Category $category
	 *
	 * @return Media
	 */
	public function setCategory(\NTR1X\MediaBundle\Entity\Category $category = null)
	{
		$this->category = $category;

		return $this;
	}

	/**
	 * Get category
	 *
	 * @return \NTR1X\MediaBundle\Entity\Category
	 */
	public function getCategory()
	{
		return $this->category;
	}

	/**
	 * Set thumbnail
	 *
	 * @param \NTR1X\UploadBundle\Entity\Upload $thumbnail
	 *
	 * @return Media
	 */
	public function setThumbnail(\NTR1X\UploadBundle\Entity\Upload $thumbnail = null)
	{
		$this->thumbnail = $thumbnail;

		return $this;
	}

	/**
	 * Get thumbnail
	 *
	 * @return \NTR1X\UploadBundle\Entity\Upload
	 */
	public function getThumbnail()
	{
		return $this->thumbnail;
	}

	/**
	 * Set search
	 *
	 * @param \NTR1X\SearchBundle\Entity\Search $search
	 *
	 * @return Media
	 */
	public function setSearch(\NTR1X\SearchBundle\Entity\Search $search = null)
	{
		$this->search = $search;

		return $this;
	}

	/**
	 * Get search
	 *
	 * @return \NTR1X\SearchBundle\Entity\Search
	 */
	public function getSearch()
	{
		return $this->search;
	}

	/**
	 * Set video
	 *
	 * @param string $video
	 *
	 * @return Item
	 */
	public function setVideo($video)
	{
		$this->video = $video;

		return $this;
	}

	/**
	 * Get video
	 *
	 * @return string
	 */
	public function getVideo()
	{
		return $this->video;
	}
}
