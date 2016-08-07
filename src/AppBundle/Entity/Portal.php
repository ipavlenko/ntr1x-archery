<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use JMS\Serializer\Annotation as JMS;

/**
 * Portal
 *
 * @ORM\Table(name="portal_items")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PortalRepository")
 * @JMS\ExclusionPolicy("none")
 */
class Portal
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
     * @ORM\Column(name="title", type="string", length=511)
     */
    private $title;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="portals")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false)
     * @JMS\Exclude
     */
    private $user;

    /**
     * @ORM\OneToOne(targetEntity="Publication", mappedBy="portal")
     */
    private $publication;

    /**
     * @ORM\Column(name="settings", type="json_array", nullable=true)
     */
    private $settings;

    /**
     * @ORM\OneToMany(targetEntity="Page", mappedBy="portal", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $pages;

    public function __construct() {
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
     * Set title
     *
     * @param array $title
     *
     * @return Portal
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return array
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\User $user
     *
     * @return Portal
     */
    public function setUser(\AppBundle\Entity\User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Add page
     *
     * @param \AppBundle\Entity\Page $page
     *
     * @return Portal
     */
    public function addPage(\AppBundle\Entity\Page $page)
    {
        $this->pages[] = $page;

        return $this;
    }

    /**
     * Remove page
     *
     * @param \AppBundle\Entity\Page $page
     */
    public function removePage(\AppBundle\Entity\Page $page)
    {
        $this->pages->removeElement($page);
    }

    /**
     * Get pages
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPages()
    {
        return $this->pages;
    }

    /**
     * Set settings
     *
     * @param array $settings
     *
     * @return Portal
     */
    public function setSettings($settings)
    {
        $this->settings = $settings;

        return $this;
    }

    /**
     * Get settings
     *
     * @return array
     */
    public function getSettings()
    {
        return $this->settings;
    }

    /**
     * Set publication
     *
     * @param \AppBundle\Entity\Publication $publication
     *
     * @return Portal
     */
    public function setPublication(\AppBundle\Entity\Publication $publication = null)
    {
        $this->publication = $publication;

        return $this;
    }

    /**
     * Get publication
     *
     * @return \AppBundle\Entity\Publication
     */
    public function getPublication()
    {
        return $this->publication;
    }
}
