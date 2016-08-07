<?php
namespace AppBundle\Entity;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\ORM\Mapping as ORM;

/**
 * Upload
 *
 * @ORM\Table(name="upload_items")
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks
 */
class Upload
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    public $id;
    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Assert\NotBlank
     */
    public $name;
    /**
     * @ORM\Column(type="string", length=255)
     * @Assert\NotBlank
     */
    public $dir;
    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    public $path;
    private $temp;
    /**
     * @Assert\File(maxSize="6000000")
     */
    private $file;
    public function getAbsolutePath() {
        return null === $this->path
            ? null
            : $this->getUploadRootDir().'/'.$this->path;
    }
    public function getWebPath() {
        return null === $this->path
            ? null
            : '/uploads/' . $this->getUploadDir().'/'.$this->path;
    }
    protected function getUploadRootDir() {
        // the absolute directory path where uploaded
        // documents should be saved
        return __DIR__.'/../../../../web/uploads/' . $this->getUploadDir();
    }
    protected function getUploadDir() {
        // get rid of the __DIR__ so it doesn't screw up
        // when displaying uploaded doc/image in the view.
        return $this->dir;
    }
    /**
     * Get file.
     *
     * @return UploadedFile
     */
    public function getFile() {
        return $this->file;
    }
    /**
     * Sets file.
     *
     * @param UploadedFile $file
     */
    public function setFile(UploadedFile $file = null) {
        $this->file = $file;
        // check if we have an old image path
        if (isset($this->path)) {
            // store the old name to delete after the update
            $this->name = $file->getClientOriginalName();
            if ($file != null) {
                $this->name = $file->getClientOriginalName();
            }
            $this->path = null;
        } else {
            if ($file != null) {
                $this->name = $file->getClientOriginalName();
            }
            $this->path = 'initial';
        }
        return $this;
    }
    /**
     * @ORM\PrePersist()
     * @ORM\PreUpdate()
     */
    public function preUpload() {
        if (null !== $this->getFile()) {
            // do whatever you want to generate a unique name
            $filename = sha1(uniqid(mt_rand(), true));
            $this->path = $filename.'.'.$this->getFile()->guessExtension();
        }
    }
    /**
     * @ORM\PostPersist()
     * @ORM\PostUpdate()
     */
    public function upload() {
        if (null === $this->getFile()) {
            return;
        }
        // if there is an error when moving the file, an exception will
        // be automatically thrown by move(). This will properly prevent
        // the entity from being persisted to the database on error
        $this->getFile()->move($this->getUploadRootDir(), $this->path);
        // check if we have an old image
        if (isset($this->temp)) {
            // delete the old image
            @unlink($this->getUploadRootDir().'/'.$this->temp);
            // clear the temp image path
            $this->temp = null;
        }
        $this->file = null;
    }
    /**
     * @ORM\PostRemove()
     */
    public function removeUpload() {
        $file = $this->getAbsolutePath();
        if ($file) {
            @unlink($file);
        }
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
     * Set name
     *
     * @param string $name
     *
     * @return Upload
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
     * Set dir
     *
     * @param string $dir
     *
     * @return Upload
     */
    public function setDir($dir)
    {
        $this->dir = $dir;
        return $this;
    }
    /**
     * Get dir
     *
     * @return string
     */
    public function getDir()
    {
        return $this->dir;
    }
    /**
     * Set path
     *
     * @param string $path
     *
     * @return Upload
     */
    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }
    /**
     * Get path
     *
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }
}
