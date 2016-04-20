<?php

namespace NTR1X\MediaBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TagItem
 *
 * @ORM\Table(name="media_tags")
 * @ORM\Entity(repositoryClass="NTR1X\MediaBundle\Repository\TagRepository")
 */
class Tag
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
	 * @var string
	 *
	 * @ORM\Column(name="name", type="string", length=511)
	 */
	private $name;

	/**
     * @ORM\ManyToOne(targetEntity="Media", inversedBy="tags")
     * @ORM\JoinColumn(name="item_id", referencedColumnName="id", nullable=false)
     */
    private $item;

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
	 * Set name
	 *
	 * @param string $name
	 *
	 * @return Tag
	 */
	public function setName($name)
	{
		$this->name = $name;

		return $this;
	}

	/**
	 * Get name
	 *
	 * @return string
	 */
	public function getName()
	{
		return $this->name;
	}

    /**
     * Set item
     *
     * @param \NTR1X\MediaBundle\Entity\Media $item
     *
     * @return Tag
     */
    public function setItem(\NTR1X\MediaBundle\Entity\Media $item = null)
    {
        $this->item = $item;

        return $this;
    }

    /**
     * Get item
     *
     * @return \NTR1X\MediaBundle\Entity\Media
     */
    public function getItem()
    {
        return $this->item;
    }
}
